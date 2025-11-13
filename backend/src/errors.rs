//! Error types and result handling for the CareerBridge API.
//!
//! This module defines application-specific errors and their conversions
//! to HTTP responses.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response, Json},
};
use serde_json::json;
use thiserror::Error;
use validator::ValidationErrors;
use sqlx::Error as SqlxError;

/// Application-level errors that can occur during request processing.
#[derive(Debug, Error)]
pub enum AppError {
    /// Internal server error for unexpected failures
    #[error("An internal server error occurred")]
    InternalServerError,
    
    /// Validation error for invalid request data
    #[error("Validation failed")]
    ValidationError(#[from] ValidationErrors),
    
    /// Database operation error
    #[error("Database error")]
    DatabaseError(#[from] SqlxError),
    
    /// Authentication or authorization failure
    #[error("Unauthorized")]
    Unauthorized,
    
    /// Requested resource not found
    #[error("Not found")]
    NotFound,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        use tracing::{error, warn, debug};
        
        // Log appropriately based on error type
        match &self {
            AppError::ValidationError(_) => debug!("Validation error: {:?}", self),
            AppError::Unauthorized => debug!("Unauthorized access attempt"),
            AppError::NotFound => debug!("Resource not found"),
            AppError::DatabaseError(err) => {
                // Check if it's a user error (like duplicate key) vs system error
                if let Some(db_err) = err.as_database_error() {
                    if db_err.is_unique_violation() {
                        warn!("Duplicate record attempt: {:?}", db_err.constraint());
                    } else {
                        error!("Database error: {:?}", self);
                    }
                } else {
                    error!("Database error: {:?}", self);
                }
            }
            AppError::InternalServerError => error!("Internal server error: {:?}", self),
        }

        let (status, error_message) = match self {
            AppError::InternalServerError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"error": "Internal Server Error"}),
            ),
            
            AppError::ValidationError(errors) => (
                StatusCode::BAD_REQUEST,
                json!({"errors": errors})
            ),
            
            AppError::DatabaseError(err) => {
                if let Some(db_err) = err.as_database_error() {
                    if db_err.is_unique_violation() {
                        // Check which constraint was violated for better error messages
                        let constraint = db_err.constraint().unwrap_or("");
                        let message = if constraint.contains("email") {
                            "An account with this email already exists. Please login or use a different email."
                        } else {
                            "A record with this information already exists."
                        };
                        
                        return (
                            StatusCode::CONFLICT,
                            Json(json!({"error": message}))
                        ).into_response();
                    }
                }
                
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"error": "Internal Server Error"})
                )
            }
            
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                json!({"error": "Unauthorized"})
            ),
            
            AppError::NotFound => (
                StatusCode::NOT_FOUND,
                json!({"error": "Not found"})
            )
        };

        (status, Json(error_message)).into_response()
    }
}

/// Result type alias for application operations.
pub type AppResult<T> = Result<T, AppError>;