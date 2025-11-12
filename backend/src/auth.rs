//! JWT-based authentication and authorization.
//!
//! This module provides JWT token creation, verification, and an Axum extractor
//! for authenticating requests.

use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{Utc, Duration};
use crate::errors::{AppError, AppResult};
use axum::{
    extract::FromRequestParts,
    http::header,
};
use axum::http::request::Parts;

/// JWT claims structure containing user information.
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject (user ID as string)
    pub sub: String,
    /// User email address
    pub email: String,
    /// Expiration timestamp (Unix epoch)
    pub exp: i64,
}

impl Claims {
    /// Creates new JWT claims with 24-hour expiration.
    /// 
    /// # Arguments
    /// 
    /// * `user_id` - The user's UUID
    /// * `email` - The user's email address
    pub fn new(user_id: Uuid, email: String) -> Self {
        let expiration = Utc::now()
            .checked_add_signed(Duration::hours(24))
            .expect("Invalid timestamp")
            .timestamp();

        Claims {
            sub: user_id.to_string(),
            email,
            exp: expiration,
        }
    }
}

/// Creates a JWT token for a user.
/// 
/// # Arguments
/// 
/// * `user_id` - The user's UUID
/// * `email` - The user's email address
/// 
/// # Returns
/// 
/// * `Ok(String)` - The encoded JWT token
/// * `Err(AppError)` - If token creation fails
pub fn create_jwt(user_id: Uuid, email: String) -> AppResult<String> {
    let claims = Claims::new(user_id, email);
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string());
    
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::InternalServerError)
}

/// Verifies and decodes a JWT token.
/// 
/// # Arguments
/// 
/// * `token` - The JWT token string to verify
/// 
/// # Returns
/// 
/// * `Ok(Claims)` - The decoded claims if token is valid
/// * `Err(AppError::Unauthorized)` - If token is invalid or expired
pub fn verify_jwt(token: &str) -> AppResult<Claims> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string());
    
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized)
}

/// Authenticated user information extracted from requests.
/// 
/// This struct is used as an Axum extractor to automatically verify
/// JWT tokens and extract user information from requests.
#[derive(Debug, Clone)]
pub struct AuthUser {
    /// The authenticated user's ID
    pub user_id: Uuid,
    /// The authenticated user's email
    #[allow(dead_code)]
    pub email: String,
}

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> impl std::future::Future<Output = Result<Self, Self::Rejection>> + Send {
        async move {
            // Extract token from Authorization header
            let auth_header = parts
                .headers
                .get(header::AUTHORIZATION)
                .and_then(|value| value.to_str().ok())
                .ok_or(AppError::Unauthorized)?;

            // Expect format: "Bearer <token>"
            let token = auth_header
                .strip_prefix("Bearer ")
                .ok_or(AppError::Unauthorized)?;

            // Verify the token
            let claims = verify_jwt(token)?;
            
            let user_id = Uuid::parse_str(&claims.sub)
                .map_err(|_| AppError::Unauthorized)?;

            Ok(AuthUser {
                user_id,
                email: claims.email,
            })
        }
    }
}
