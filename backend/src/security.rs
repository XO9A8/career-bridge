//! Password hashing and verification using Argon2.
//!
//! This module provides secure password handling functions that run
//! in background threads to avoid blocking async operations.

use crate::errors::{AppError, AppResult};
use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use tokio::task::spawn_blocking;
use tracing::error;

/// Hashes a password using Argon2 algorithm.
/// 
/// This function runs in a blocking thread pool to avoid blocking the async runtime.
/// 
/// # Arguments
/// 
/// * `password` - The plaintext password to hash
/// 
/// # Returns
/// 
/// * `Ok(String)` - The hashed password string
/// * `Err(AppError)` - If hashing fails
/// 
/// # Example
/// 
/// ```no_run
/// # use backend::security::hash_password;
/// # async {
/// let hashed = hash_password("my_password".to_string()).await?;
/// # Ok::<(), backend::errors::AppError>(())
/// # };
/// ```
pub async fn hash_password(password: String) -> AppResult<String> {
    spawn_blocking(move || {
        let salt = SaltString::generate(&mut OsRng);

        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| {
                error!("Failed to hash password: {}", e);
                AppError::InternalServerError
            })?
            .to_string();

        Ok(password_hash)
    })
    .await
    .map_err(|e| {
        error!("Task join error during password hash: {}", e);
        AppError::InternalServerError
    })?
}

/// Verifies a password against its hash.
/// 
/// This function runs in a blocking thread pool to avoid blocking the async runtime.
/// 
/// # Arguments
/// 
/// * `hash` - The hashed password string to verify against
/// * `password` - The plaintext password to verify
/// 
/// # Returns
/// 
/// * `Ok(true)` - If the password matches the hash
/// * `Ok(false)` - If the password doesn't match
/// * `Err(AppError)` - If verification fails unexpectedly
pub async fn verify_password(hash: String, password: String) -> AppResult<bool> {
    spawn_blocking(move || {
        let parsed_hash = PasswordHash::new(&hash).map_err(|e| {
            error!("Failed to parse password hash: {}", e);
            AppError::InternalServerError
        })?;

        let argon2 = Argon2::default();

        let result = argon2.verify_password(password.as_bytes(), &parsed_hash);

        match result {
            Ok(_) => Ok(true),
            Err(argon2::password_hash::Error::Password) => Ok(false),
            Err(e) => {
                error!("Password verification error: {}", e);
                Err(AppError::InternalServerError)
            }
        }
    })
    .await
    .map_err(|e| {
        error!("Task join error during password verify: {}", e);
        AppError::InternalServerError
    })?
}
