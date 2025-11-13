//! Job application tracking handlers.

use axum::{extract::{State, Path}, Json};
use tracing::{info, debug};
use crate::models::ApplicationTracking;
use crate::errors::AppResult;
use crate::auth::AuthUser;
use crate::AppState;
use super::types::{CreateApplicationPayload, UpdateApplicationPayload};

/// Creates a new job application record.
/// 
/// Tracks when a user applies to a job with optional notes.
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Job ID doesn't exist
/// - Database operation fails
pub async fn create_application(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Json(payload): Json<CreateApplicationPayload>,
) -> AppResult<Json<ApplicationTracking>> {
    info!("Creating application for user: {}, job_id: {}", 
          auth_user.user_id, payload.job_id);
    
    let application = sqlx::query_as!(
        ApplicationTracking,
        r#"
        INSERT INTO application_tracking (user_id, job_id, notes)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, job_id, status, applied_at, notes
        "#,
        auth_user.user_id,
        payload.job_id,
        payload.notes
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    info!("Application created successfully: application_id={}, user_id={}, job_id={}",
          application.id.unwrap_or(0), auth_user.user_id, payload.job_id);
    
    Ok(Json(application))
}

/// Retrieves all applications for the authenticated user.
/// 
/// Returns applications ordered by application date (most recent first).
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Database operation fails
pub async fn get_my_applications(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Json<Vec<ApplicationTracking>>> {
    info!("Fetching applications for user: {}", auth_user.user_id);
    
    let applications = sqlx::query_as!(
        ApplicationTracking,
        r#"
        SELECT id, user_id, job_id, status, applied_at, notes
        FROM application_tracking
        WHERE user_id = $1
        ORDER BY applied_at DESC
        "#,
        auth_user.user_id
    )
    .fetch_all(&app_state.db_pool)
    .await?;

    debug!("Retrieved {} applications for user: {}", applications.len(), auth_user.user_id);
    
    Ok(Json(applications))
}

/// Updates an existing application.
/// 
/// Updates application status and/or notes. Only the user who created
/// the application can update it.
/// 
/// # Path Parameters
/// 
/// - `application_id` - ID of the application to update
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Application doesn't exist or doesn't belong to user
/// - Database operation fails
pub async fn update_application(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Path(application_id): Path<i32>,
    Json(payload): Json<UpdateApplicationPayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Updating application: application_id={}, user_id={}, new_status={}",
          application_id, auth_user.user_id, payload.status);
    
    sqlx::query!(
        r#"
        UPDATE application_tracking
        SET status = $1, notes = COALESCE($2, notes)
        WHERE id = $3 AND user_id = $4
        "#,
        payload.status,
        payload.notes,
        application_id,
        auth_user.user_id
    )
    .execute(&app_state.db_pool)
    .await?;

    info!("Application updated successfully: application_id={}", application_id);
    
    Ok(Json(serde_json::json!({
        "message": "Application updated successfully"
    })))
}
