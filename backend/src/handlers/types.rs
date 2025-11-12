//! Shared request and response types for all handlers.
//!
//! This module contains all payload structures, query parameters,
//! and response types used across the API endpoints.

use serde::{Deserialize, Serialize};
use validator::Validate;
use uuid::Uuid;
use crate::models::*;

/// User registration payload.
#[derive(Debug, Deserialize, Validate)]
pub struct RegisterPayload {
    /// Full name of the user
    #[validate(length(min = 1, message = "Full name is required"))]
    pub full_name: String,
    /// Email address (must be valid email format)
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
    /// Password (minimum 8 characters)
    #[validate(length(min = 8, message = "Password must be at least 8 characters long"))]
    pub password: String,
    /// Educational background
    pub education_level: Option<String>,
    /// Experience level
    pub experience_level: ExperienceLevel,
    /// Preferred career track
    pub preferred_track: CareerTrack,
}

/// User login payload.
#[derive(Debug, Deserialize, Validate)]
pub struct LoginPayload {
    /// Email address
    #[validate(email(message = "Invalid email format"))]
    pub email: String,
    /// Password
    #[validate(length(min = 1, message = "Password is required"))]
    pub password: String,
}

/// Login response containing JWT token and user profile.
#[derive(Debug, Serialize)]
pub struct LoginResponse {
    /// JWT authentication token
    pub token: String,
    /// User profile information
    pub user: UserProfile,
}

/// User profile information (excludes sensitive data).
#[derive(Debug, Serialize)]
pub struct UserProfile {
    /// User ID
    pub id: Uuid,
    /// Full name
    pub full_name: String,
    /// Email address
    pub email: String,
    /// Educational background
    pub education_level: Option<String>,
    /// Experience level
    pub experience_level: ExperienceLevel,
    /// Preferred career track
    pub preferred_track: CareerTrack,
    /// User's skills
    pub skills: Vec<String>,
    /// User's projects
    pub projects: Vec<String>,
    /// Target job roles
    pub target_roles: Vec<String>,
}

/// Profile update payload (all fields optional).
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProfilePayload {
    /// Updated full name
    pub full_name: Option<String>,
    /// Updated education level
    pub education_level: Option<String>,
    /// Updated skills list
    pub skills: Option<Vec<String>>,
    /// Updated projects list
    pub projects: Option<Vec<String>>,
    /// Updated target roles
    pub target_roles: Option<Vec<String>>,
    /// Raw CV/resume text
    pub raw_cv_text: Option<String>,
}

/// Query parameters for job recommendations.
#[derive(Debug, Deserialize)]
pub struct JobQueryParams {
    /// Filter by experience level
    pub experience_level: Option<ExperienceLevel>,
    /// Filter by job type
    #[allow(dead_code)]
    pub job_type: Option<JobType>,
    /// Maximum number of results to return
    pub limit: Option<i64>,
}

/// Job recommendation with match analysis.
#[derive(Debug, Serialize)]
pub struct JobRecommendation {
    /// The job listing
    pub job: Job,
    /// Match score as percentage (0-100)
    pub match_score: f64,
    /// Skills that match between user and job
    pub matched_skills: Vec<String>,
    /// Skills required by job that user doesn't have
    pub missing_skills: Vec<String>,
}

/// Learning resource recommendation with relevance scoring.
#[derive(Debug, Serialize)]
pub struct ResourceRecommendation {
    /// The learning resource
    pub resource: LearningResource,
    /// Relevance score as percentage (0-100)
    pub relevance_score: f64,
    /// Skills this resource can help develop
    pub target_skills: Vec<String>,
}

/// Skill gap analysis for a target role.
#[derive(Debug, Serialize)]
pub struct SkillGapAnalysis {
    /// User's current skills
    pub user_skills: Vec<String>,
    /// Target role being analyzed
    pub target_role: String,
    /// All skills required for the role
    pub required_skills: Vec<String>,
    /// Skills the user needs to acquire
    pub skill_gaps: Vec<String>,
    /// Skills the user already has
    pub matching_skills: Vec<String>,
    /// Percentage of required skills the user has
    pub match_percentage: f64,
    /// Recommended resources to close skill gaps
    pub recommended_resources: Vec<LearningResource>,
}

/// Payload for creating a new job application.
#[derive(Debug, Deserialize)]
pub struct CreateApplicationPayload {
    /// ID of the job being applied to
    pub job_id: i32,
    /// Optional notes about the application
    pub notes: Option<String>,
}

/// Payload for updating an existing application.
#[derive(Debug, Deserialize)]
pub struct UpdateApplicationPayload {
    /// New application status
    pub status: String,
    /// Updated notes
    pub notes: Option<String>,
}

/// Payload for updating learning resource progress.
#[derive(Debug, Deserialize)]
pub struct UpdateProgressPayload {
    /// Completion percentage (0-100)
    pub completion_percentage: i32,
}
