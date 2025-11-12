//! # CareerBridge Backend API
//!
//! A comprehensive career development platform API built with Rust and Axum.
//!
//! ## Features
//!
//! - **User Authentication**: Secure JWT-based authentication with Argon2 password hashing
//! - **Profile Management**: Create and update user profiles with skills, projects, and career goals
//! - **Job Recommendations**: AI-powered job matching based on user skills and experience
//! - **Skill Gap Analysis**: Identify skill gaps for target roles and get personalized recommendations
//! - **Learning Resources**: Curated learning resources with progress tracking
//! - **Application Tracking**: Track job applications and their status
//!
//! ## Architecture
//!
//! The codebase is organized into the following modules:
//!
//! - [`models`] - Database models and data structures
//! - [`handlers`] - HTTP request handlers organized by feature
//! - [`auth`] - JWT authentication and authorization
//! - [`security`] - Password hashing and verification
//! - [`errors`] - Error types and HTTP response conversions
//!
//! ## Example Usage
//!
//! ```rust,no_run
//! use backend::AppState;
//! use sqlx::PgPool;
//!
//! #[tokio::main]
//! async fn main() {
//!     let db_pool = PgPool::connect("postgresql://localhost/careerbridge")
//!         .await
//!         .expect("Failed to connect to database");
//!     
//!     let app_state = AppState { db_pool };
//!     let app = backend::handlers::create_router(app_state);
//!     
//!     // Server setup...
//! }
//! ```
//!
//! ## Database Schema
//!
//! The application uses PostgreSQL with the following main tables:
//!
//! - `users` - User accounts and profiles
//! - `jobs` - Job listings
//! - `learning_resources` - Educational content
//! - `application_tracking` - Job application history
//! - `user_progress` - Learning progress tracking
//!
//! ## API Endpoints
//!
//! ### Public Endpoints
//!
//! - `POST /api/register` - Register a new user
//! - `POST /api/login` - Authenticate and receive JWT token
//!
//! ### Protected Endpoints (require JWT)
//!
//! - `GET /api/profile` - Get user profile
//! - `PUT /api/profile` - Update user profile
//! - `GET /api/jobs/recommendations` - Get job recommendations
//! - `GET /api/learning/recommendations` - Get learning resource recommendations
//! - `GET /api/skill-gap/:target_role` - Analyze skill gaps for a role
//! - `POST /api/applications` - Create job application
//! - `GET /api/applications` - List user's applications
//! - `PUT /api/applications/:id` - Update application status
//! - `POST /api/progress/resource/:id/start` - Start tracking resource
//! - `PUT /api/progress/resource/:id` - Update progress
//! - `GET /api/progress` - Get all progress records
//!
//! ## Environment Variables
//!
//! Required environment variables:
//!
//! - `DATABASE_URL` - PostgreSQL connection string
//! - `JWT_SECRET` - Secret key for JWT signing (optional, defaults to development key)

use sqlx::PgPool;

pub mod errors;
pub mod handlers;
pub mod models;
pub mod security;
pub mod auth;

/// Application state shared across all request handlers.
/// 
/// Contains the database connection pool and is cloned for each request.
#[derive(Clone)]
pub struct AppState {
    /// PostgreSQL database connection pool
    pub db_pool: PgPool,
}
