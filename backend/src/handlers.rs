//! HTTP request handlers for the CareerBridge API.
//!
//! This module contains all endpoint handlers organized by feature:
//! - `auth` - Authentication and registration
//! - `profile` - User profile management
//! - `jobs` - Job recommendations
//! - `learning` - Learning resources and skill gap analysis
//! - `applications` - Application tracking
//! - `progress` - Learning progress tracking
//! - `types` - Shared request/response types

mod types;
mod auth;
mod profile;
mod jobs;
mod learning;
mod applications;
mod progress;
mod oauth;

#[allow(unused_imports)]
pub use types::*;

use axum::{
    routing::{get, post, put},
    Router,
};
use crate::errors::AppResult;
use crate::AppState;

/// Creates the application router with all routes configured.
/// 
/// # Arguments
/// 
/// * `app_state` - The shared application state
/// 
/// # Returns
/// 
/// A configured Axum Router with all API endpoints
pub fn create_router(app_state: AppState) -> Router {
    use tracing::info;
    
    info!("Setting up API routes:");
    info!("  ✓ Public routes: /, /api/register, /api/login");
    info!("  ✓ OAuth routes: /api/auth/google, /api/auth/github");
    info!("  ✓ Protected routes: profile, jobs, learning, applications, progress");
    
    Router::new()
        // Public routes
        .route("/", get(root))
        .route("/api/register", post(auth::register))
        .route("/api/login", post(auth::login))
        
        // OAuth routes
        .route("/api/auth/google", get(oauth::google_login))
        .route("/api/auth/google/callback", get(oauth::google_callback))
        .route("/api/auth/github", get(oauth::github_login))
        .route("/api/auth/github/callback", get(oauth::github_callback))
        
        // Protected routes - Profile
        .route("/api/profile", get(profile::get_profile))
        .route("/api/profile/complete", post(profile::complete_profile))
        .route("/api/profile", put(profile::update_profile))
        
        // Protected routes - Job Recommendations
        .route("/api/jobs/recommendations", get(jobs::get_job_recommendations))
        
        // Protected routes - Learning Resources
        .route("/api/learning/recommendations", get(learning::get_learning_recommendations))
        
        // Protected routes - Skill Gap Analysis
        .route("/api/skill-gap/{target_role}", get(learning::analyze_skill_gap))
        
        // Protected routes - Application Tracking
        .route("/api/applications", post(applications::create_application))
        .route("/api/applications", get(applications::get_my_applications))
        .route("/api/applications/{id}", put(applications::update_application))
        
        // Protected routes - Progress Tracking
        .route("/api/progress/resource/{id}/start", post(progress::start_resource))
        .route("/api/progress/resource/{id}", put(progress::update_resource_progress))
        .route("/api/progress", get(progress::get_my_progress))
        
        .with_state(app_state)
}

/// Root endpoint handler.
/// 
/// Returns a welcome message for the API.
async fn root() -> AppResult<&'static str> {
    Ok("CareerBridge API - SDG 8 Hackathon Project")
}