//! Authentication handlers for user registration and login.

use axum::{extract::State, Json};
use validator::Validate;
use tracing::{info, warn, error, debug};
use crate::models::{User, ExperienceLevel, CareerTrack};
use crate::errors::{AppResult, AppError};
use crate::security::{hash_password, verify_password};
use crate::auth::create_jwt;
use crate::AppState;
use super::types::{RegisterPayload, LoginPayload, LoginResponse, UserProfile};

/// Registers a new user account with simplified onboarding.
/// 
/// Creates a new user with only name, email, and hashed password.
/// The user can complete their profile later via the profile completion endpoint.
/// Returns a JWT token for immediate authentication.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - Validation fails (invalid email, short password, etc.)
/// - Email is already registered (unique constraint violation)
/// - Database operation fails
/// - JWT token generation fails
pub async fn register(
    State(app_state): State<AppState>,
    Json(payload): Json<RegisterPayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Received registration request for email: {}", payload.email);
    
    payload.validate().map_err(|e| {
        warn!("Registration validation failed for {}: {}", payload.email, e);
        e
    })?;
    
    debug!("Hashing password for user: {}", payload.email);
    let hashed_password = hash_password(payload.password).await?;
    
    let user_id = sqlx::query_scalar!(
        r#"
        INSERT INTO users (full_name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id
        "#,
        payload.full_name,
        payload.email,
        hashed_password
    )
    .fetch_one(&app_state.db_pool)
    .await
    .map_err(|e| {
        // Check for unique constraint violation (duplicate email)
        if let Some(db_err) = e.as_database_error() {
            if db_err.is_unique_violation() {
                warn!("Registration failed: Email already exists - {}", payload.email);
                return AppError::DatabaseError(e);
            }
        }
        error!("Database error during registration for {}: {}", payload.email, e);
        AppError::DatabaseError(e)
    })?;

    info!("User created successfully: user_id={}, email={}", user_id, payload.email);
    
    // Generate JWT token for immediate login
    debug!("Generating JWT token for user: {}", user_id);
    let token = create_jwt(user_id, payload.email.clone())?;
    
    info!("Registration successful for user: {}", user_id);

    Ok(Json(serde_json::json!({
        "message": "User registered successfully",
        "token": token,
        "user_id": user_id
    })))
}

/// Authenticates a user and returns a JWT token with profile information.
/// 
/// Verifies email and password, then generates a JWT token for authenticated requests.
/// Returns user profile including `profile_completed` status to determine if
/// onboarding is required.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - Validation fails
/// - User with email doesn't exist
/// - Password doesn't match
/// - Token generation fails
pub async fn login(
    State(app_state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> AppResult<Json<LoginResponse>> {
    info!("Login attempt received for: {}", payload.email);
    
    payload.validate().map_err(|e| {
        warn!("Login validation failed for {}: {}", payload.email, e);
        e
    })?;

    // Fetch user from database
    debug!("Fetching user from database: {}", payload.email);
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, full_name, email, education_level,
            experience_level as "experience_level: ExperienceLevel",
            preferred_track as "preferred_track: CareerTrack",
            profile_completed as "profile_completed!",
            skills, projects, target_roles, raw_cv_text, password_hash
        FROM users 
        WHERE email = $1
        "#,
        payload.email
    )
    .fetch_optional(&app_state.db_pool)
    .await?
    .ok_or_else(|| {
        warn!("Login failed: User not found - {}", payload.email);
        AppError::Unauthorized
    })?;

    info!("User found: user_id={}, profile_completed={}", user.id, user.profile_completed);
    
    // Verify password
    debug!("Verifying password for user: {}", user.id);
    let is_valid = verify_password(user.password_hash.clone(), payload.password).await?;
    if !is_valid {
        warn!("Login failed: Invalid password for user - {}", payload.email);
        return Err(AppError::Unauthorized);
    }
    
    info!("Password verified successfully for user: {}", user.id);

    // Generate JWT token
    debug!("Generating JWT token for user: {}", user.id);
    let token = create_jwt(user.id, user.email.clone())?;
    
    info!("Login successful for user: user_id={}, email={}", user.id, user.email);

    Ok(Json(LoginResponse {
        token,
        user: UserProfile {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            profile_completed: user.profile_completed,
            education_level: user.education_level,
            experience_level: user.experience_level,
            preferred_track: user.preferred_track,
            skills: user.skills,
            projects: user.projects,
            target_roles: user.target_roles,
        },
    }))
}
