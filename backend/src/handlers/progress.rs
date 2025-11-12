//! Learning resource progress tracking handlers.

use axum::{extract::{State, Path}, Json};
use crate::models::UserProgress;
use crate::errors::AppResult;
use crate::auth::AuthUser;
use crate::AppState;
use super::types::UpdateProgressPayload;

/// Starts tracking progress for a learning resource.
/// 
/// Creates a new progress record with 0% completion. If the user has already
/// started this resource, the existing record is returned.
/// 
/// # Path Parameters
/// 
/// - `resource_id` - ID of the learning resource to track
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Resource ID doesn't exist
/// - Database operation fails
pub async fn start_resource(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Path(resource_id): Path<i32>,
) -> AppResult<Json<UserProgress>> {
    let progress = sqlx::query_as!(
        UserProgress,
        r#"
        INSERT INTO user_progress (user_id, resource_id, completion_percentage)
        VALUES ($1, $2, 0)
        ON CONFLICT (user_id, resource_id) DO NOTHING
        RETURNING id, user_id, resource_id, completion_percentage, started_at, completed_at
        "#,
        auth_user.user_id,
        resource_id
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    Ok(Json(progress))
}

/// Updates progress for a learning resource.
/// 
/// Updates the completion percentage. Automatically sets `completed_at`
/// timestamp when completion reaches 100%.
/// 
/// # Path Parameters
/// 
/// - `resource_id` - ID of the learning resource
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Progress record doesn't exist
/// - Database operation fails
pub async fn update_resource_progress(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Path(resource_id): Path<i32>,
    Json(payload): Json<UpdateProgressPayload>,
) -> AppResult<Json<serde_json::Value>> {
    let completed_at = if payload.completion_percentage >= 100 {
        Some(chrono::Utc::now())
    } else {
        None
    };

    sqlx::query!(
        r#"
        UPDATE user_progress
        SET completion_percentage = $1, completed_at = $2
        WHERE user_id = $3 AND resource_id = $4
        "#,
        payload.completion_percentage,
        completed_at,
        auth_user.user_id,
        resource_id
    )
    .execute(&app_state.db_pool)
    .await?;

    Ok(Json(serde_json::json!({
        "message": "Progress updated successfully"
    })))
}

/// Retrieves all progress records for the authenticated user.
/// 
/// Returns progress records ordered by start date (most recent first).
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Database operation fails
pub async fn get_my_progress(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Json<Vec<UserProgress>>> {
    let progress = sqlx::query_as!(
        UserProgress,
        r#"
        SELECT id, user_id, resource_id, completion_percentage, started_at, completed_at
        FROM user_progress
        WHERE user_id = $1
        ORDER BY started_at DESC
        "#,
        auth_user.user_id
    )
    .fetch_all(&app_state.db_pool)
    .await?;

    Ok(Json(progress))
}
