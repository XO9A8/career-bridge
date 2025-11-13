//! User profile management handlers.

use axum::{extract::State, Json};
use validator::Validate;
use tracing::{info, warn, error, debug};
use crate::models::{User, ExperienceLevel, CareerTrack};
use crate::errors::{AppResult, AppError};
use crate::auth::AuthUser;
use crate::AppState;
use super::types::{UserProfile, UpdateProfilePayload};

/// Retrieves the authenticated user's profile.
/// 
/// Returns user profile information including `profile_completed` flag.
/// Frontend can use this to show onboarding prompts if needed.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - User not found in database
/// - Database operation fails
pub async fn get_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Json<UserProfile>> {
    info!("Fetching profile for user: {}", auth_user.user_id);
    
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
        WHERE id = $1
        "#,
        auth_user.user_id
    )
    .fetch_optional(&app_state.db_pool)
    .await?
    .ok_or_else(|| {
        error!("User profile not found: {}", auth_user.user_id);
        AppError::NotFound
    })?;

    debug!("Profile retrieved: user_id={}, profile_completed={}", user.id, user.profile_completed);
    
    Ok(Json(UserProfile {
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
    }))
}

/// Completes the user's profile after initial registration (onboarding step).
/// 
/// This is the second step in the user onboarding flow. After registering with
/// just name, email, and password, users call this endpoint to provide:
/// - Education level
/// - Experience level (required)
/// - Preferred career track (required)
/// - Skills, projects, and target roles (optional)
/// 
/// Sets `profile_completed = TRUE` to indicate the user has finished onboarding.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Validation fails (missing required fields)
/// - Database operation fails
pub async fn complete_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Json(payload): Json<super::types::CompleteProfilePayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Completing profile for user: {}", auth_user.user_id);
    
    payload.validate().map_err(|e| {
        warn!("Profile completion validation failed for user {}: {}", auth_user.user_id, e);
        e
    })?;
    
    debug!("Profile data: experience_level={:?}, preferred_track={:?}", 
           payload.experience_level, payload.preferred_track);

    sqlx::query!(
        r#"
        UPDATE users 
        SET education_level = $1,
            experience_level = $2,
            preferred_track = $3,
            skills = $4,
            projects = $5,
            target_roles = $6,
            profile_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        "#,
        payload.education_level,
        payload.experience_level as _,
        payload.preferred_track as _,
        &payload.skills.unwrap_or_default(),
        &payload.projects.unwrap_or_default(),
        &payload.target_roles.unwrap_or_default(),
        auth_user.user_id
    )
    .execute(&app_state.db_pool)
    .await
    .map_err(|e| {
        error!("Failed to complete profile for user {}: {}", auth_user.user_id, e);
        e
    })?;

    info!("Profile completed successfully for user: {}", auth_user.user_id);
    
    Ok(Json(serde_json::json!({
        "message": "Profile completed successfully"
    })))
}

/// Updates the authenticated user's profile after onboarding.
/// 
/// Allows users to modify their profile information after completing onboarding.
/// Updates only the fields provided in the payload. Omitted fields remain unchanged.
/// Can update experience level, preferred track, and all other profile fields.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Validation fails
/// - Database operation fails
pub async fn update_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Json(payload): Json<UpdateProfilePayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Updating profile for user: {}", auth_user.user_id);
    
    payload.validate().map_err(|e| {
        warn!("Profile update validation failed for user {}: {}", auth_user.user_id, e);
        e
    })?;

    let mut updated_fields = Vec::new();
    
    // Simple approach: update each field if provided
    if let Some(full_name) = payload.full_name {
        debug!("Updating full_name for user: {}", auth_user.user_id);
        updated_fields.push("full_name");
        sqlx::query!("UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", full_name, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(education_level) = payload.education_level {
        updated_fields.push("education_level");
        sqlx::query!("UPDATE users SET education_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", education_level, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(experience_level) = payload.experience_level {
        updated_fields.push("experience_level");
        sqlx::query!("UPDATE users SET experience_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", experience_level as _, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(preferred_track) = payload.preferred_track {
        updated_fields.push("preferred_track");
        sqlx::query!("UPDATE users SET preferred_track = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", preferred_track as _, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(skills) = payload.skills {
        updated_fields.push("skills");
        sqlx::query!("UPDATE users SET skills = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", &skills, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(projects) = payload.projects {
        updated_fields.push("projects");
        sqlx::query!("UPDATE users SET projects = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", &projects, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(target_roles) = payload.target_roles {
        updated_fields.push("target_roles");
        sqlx::query!("UPDATE users SET target_roles = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", &target_roles, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(raw_cv_text) = payload.raw_cv_text {
        updated_fields.push("raw_cv_text");
        sqlx::query!("UPDATE users SET raw_cv_text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", raw_cv_text, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }

    info!("Profile updated successfully for user {}: fields updated: {:?}", 
          auth_user.user_id, updated_fields);
    
    Ok(Json(serde_json::json!({
        "message": "Profile updated successfully"
    })))
}
