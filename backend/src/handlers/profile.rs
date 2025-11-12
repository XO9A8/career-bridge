//! User profile management handlers.

use axum::{extract::State, Json};
use validator::Validate;
use crate::models::{User, ExperienceLevel, CareerTrack};
use crate::errors::{AppResult, AppError};
use crate::auth::AuthUser;
use crate::AppState;
use super::types::{UserProfile, UpdateProfilePayload};

/// Retrieves the authenticated user's profile.
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
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, full_name, email, education_level,
            experience_level as "experience_level: ExperienceLevel",
            preferred_track as "preferred_track: CareerTrack",
            skills, projects, target_roles, raw_cv_text, password_hash
        FROM users 
        WHERE id = $1
        "#,
        auth_user.user_id
    )
    .fetch_optional(&app_state.db_pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(UserProfile {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        education_level: user.education_level,
        experience_level: user.experience_level,
        preferred_track: user.preferred_track,
        skills: user.skills,
        projects: user.projects,
        target_roles: user.target_roles,
    }))
}

/// Updates the authenticated user's profile.
/// 
/// Updates only the fields provided in the payload. Omitted fields remain unchanged.
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
    payload.validate()?;

    // Simple approach: update each field if provided
    if let Some(full_name) = payload.full_name {
        sqlx::query!("UPDATE users SET full_name = $1 WHERE id = $2", full_name, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(education_level) = payload.education_level {
        sqlx::query!("UPDATE users SET education_level = $1 WHERE id = $2", education_level, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(skills) = payload.skills {
        sqlx::query!("UPDATE users SET skills = $1 WHERE id = $2", &skills, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(projects) = payload.projects {
        sqlx::query!("UPDATE users SET projects = $1 WHERE id = $2", &projects, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(target_roles) = payload.target_roles {
        sqlx::query!("UPDATE users SET target_roles = $1 WHERE id = $2", &target_roles, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }
    if let Some(raw_cv_text) = payload.raw_cv_text {
        sqlx::query!("UPDATE users SET raw_cv_text = $1 WHERE id = $2", raw_cv_text, auth_user.user_id)
            .execute(&app_state.db_pool).await?;
    }

    Ok(Json(serde_json::json!({
        "message": "Profile updated successfully"
    })))
}
