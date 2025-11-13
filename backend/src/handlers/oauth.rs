//! OAuth authentication handlers for Google and GitHub login.
//!
//! This module provides endpoints for OAuth-based authentication, allowing users
//! to sign up and log in using their Google or GitHub accounts.

use axum::{
    extract::{Query, State},
    response::Redirect,
};
use oauth2::{
    AuthorizationCode, AuthUrl, ClientId, ClientSecret, CsrfToken, 
    RedirectUrl, TokenResponse, TokenUrl,
    basic::BasicClient,
    reqwest::async_http_client,
};
use serde::Deserialize;
use uuid::Uuid;
use tracing::{info, warn, error, debug};

use crate::{
    AppState, auth::create_jwt, errors::{AppError, AppResult},
    models::OAuthUser,
};
use super::types::OAuthCallback;

/// Google user info from OAuth API
#[derive(Debug, Deserialize)]
struct GoogleUserInfo {
    id: String,
    email: String,
    name: String,
    picture: Option<String>,
}

/// GitHub user info from OAuth API
#[derive(Debug, Deserialize)]
struct GitHubUserInfo {
    id: i64,
    email: Option<String>,
    name: Option<String>,
    login: String,
    avatar_url: Option<String>,
}

/// GitHub email info (for private emails)
#[derive(Debug, Deserialize)]
struct GitHubEmail {
    email: String,
    primary: bool,
    verified: bool,
}

/// Initiates Google OAuth flow
pub async fn google_login(State(_state): State<AppState>) -> AppResult<Redirect> {
    info!("Initiating Google OAuth login flow");
    
    let google_client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|e| {
            error!("GOOGLE_CLIENT_ID not set in environment: {}", e);
            AppError::InternalServerError
        })?;
    let google_redirect_uri = std::env::var("GOOGLE_REDIRECT_URI")
        .map_err(|e| {
            error!("GOOGLE_REDIRECT_URI not set in environment: {}", e);
            AppError::InternalServerError
        })?;
    
    debug!("Google redirect URI: {}", google_redirect_uri);

    let client = BasicClient::new(
        ClientId::new(google_client_id),
        Some(ClientSecret::new(
            std::env::var("GOOGLE_CLIENT_SECRET")
                .map_err(|_| AppError::InternalServerError)?,
        )),
        AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
            .map_err(|_| AppError::InternalServerError)?,
        Some(
            TokenUrl::new("https://www.googleapis.com/oauth2/v3/token".to_string())
                .map_err(|_| AppError::InternalServerError)?,
        ),
    )
    .set_redirect_uri(
        RedirectUrl::new(google_redirect_uri)
            .map_err(|_| AppError::InternalServerError)?,
    );

    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(oauth2::Scope::new("email".to_string()))
        .add_scope(oauth2::Scope::new("profile".to_string()))
        .url();

    debug!("Generated CSRF token: {}", csrf_token.secret());
    info!("Redirecting to Google OAuth URL: {}", auth_url);
    
    Ok(Redirect::to(auth_url.as_str()))
}

/// Handles Google OAuth callback
pub async fn google_callback(
    State(app_state): State<AppState>,
    Query(params): Query<OAuthCallback>,
) -> AppResult<Redirect> {
    info!("Received Google OAuth callback");
    debug!("Authorization code length: {}", params.code.len());
    
    let google_client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|e| {
            error!("GOOGLE_CLIENT_ID not set: {}", e);
            AppError::InternalServerError
        })?;
    let google_client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .map_err(|e| {
            error!("GOOGLE_CLIENT_SECRET not set: {}", e);
            AppError::InternalServerError
        })?;
    let google_redirect_uri = std::env::var("GOOGLE_REDIRECT_URI")
        .map_err(|e| {
            error!("GOOGLE_REDIRECT_URI not set: {}", e);
            AppError::InternalServerError
        })?;
    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
    
    debug!("Frontend URL: {}", frontend_url);

    let client = BasicClient::new(
        ClientId::new(google_client_id),
        Some(ClientSecret::new(google_client_secret)),
        AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
            .map_err(|_| AppError::InternalServerError)?,
        Some(
            TokenUrl::new("https://www.googleapis.com/oauth2/v3/token".to_string())
                .map_err(|_| AppError::InternalServerError)?,
        ),
    )
    .set_redirect_uri(
        RedirectUrl::new(google_redirect_uri)
            .map_err(|_| AppError::InternalServerError)?,
    );

    info!("Exchanging authorization code for access token");
    let token_result = client
        .exchange_code(AuthorizationCode::new(params.code))
        .request_async(async_http_client)
        .await
        .map_err(|e| {
            error!("Failed to exchange Google authorization code: {}", e);
            AppError::Unauthorized
        })?;

    info!("Successfully obtained access token, fetching user info from Google");
    // Fetch user info from Google
    let user_info: GoogleUserInfo = reqwest::Client::new()
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .bearer_auth(token_result.access_token().secret())
        .send()
        .await
        .map_err(|e| {
            error!("Failed to fetch user info from Google API: {}", e);
            AppError::InternalServerError
        })?
        .json()
        .await
        .map_err(|e| {
            error!("Failed to parse Google user info JSON: {}", e);
            AppError::InternalServerError
        })?;

    info!("Retrieved Google user info: email={}, name={}", user_info.email, user_info.name);
    
    let oauth_user = OAuthUser {
        id: user_info.id.clone(),
        email: user_info.email.clone(),
        name: user_info.name.clone(),
        avatar_url: user_info.picture.clone(),
    };

    info!("Processing OAuth user authentication for Google ID: {}", user_info.id);
    let (user_id, is_new_user) = handle_oauth_user(&app_state, oauth_user, "google").await?;
    info!("Generating JWT token for user: {}, new_user={}", user_id, is_new_user);
    let token = create_jwt(user_id, format!("google_{}", user_id))?;

    let redirect_url = format!(
        "{}/auth/callback?token={}&new_user={}",
        frontend_url, token, is_new_user
    );
    info!("Google OAuth successful! Redirecting to frontend: {}", redirect_url);
    
    // Redirect to frontend with token
    Ok(Redirect::to(&redirect_url))
}

/// Initiates GitHub OAuth flow
pub async fn github_login(State(_state): State<AppState>) -> AppResult<Redirect> {
    info!("Initiating GitHub OAuth login flow");
    
    let github_client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|e| {
            error!("GITHUB_CLIENT_ID not set in environment: {}", e);
            AppError::InternalServerError
        })?;
    let github_redirect_uri = std::env::var("GITHUB_REDIRECT_URI")
        .map_err(|e| {
            error!("GITHUB_REDIRECT_URI not set in environment: {}", e);
            AppError::InternalServerError
        })?;
    
    debug!("GitHub redirect URI: {}", github_redirect_uri);

    let client = BasicClient::new(
        ClientId::new(github_client_id),
        Some(ClientSecret::new(
            std::env::var("GITHUB_CLIENT_SECRET")
                .map_err(|_| AppError::InternalServerError)?,
        )),
        AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
            .map_err(|_| AppError::InternalServerError)?,
        Some(
            TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
                .map_err(|_| AppError::InternalServerError)?,
        ),
    )
    .set_redirect_uri(
        RedirectUrl::new(github_redirect_uri)
            .map_err(|_| AppError::InternalServerError)?,
    );

    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(oauth2::Scope::new("user:email".to_string()))
        .url();

    debug!("Generated CSRF token: {}", csrf_token.secret());
    info!("Redirecting to GitHub OAuth URL: {}", auth_url);
    
    Ok(Redirect::to(auth_url.as_str()))
}

/// Handles GitHub OAuth callback
pub async fn github_callback(
    State(app_state): State<AppState>,
    Query(params): Query<OAuthCallback>,
) -> AppResult<Redirect> {
    info!("Received GitHub OAuth callback");
    debug!("Authorization code length: {}", params.code.len());
    
    let github_client_id = std::env::var("GITHUB_CLIENT_ID")
        .map_err(|e| {
            error!("GITHUB_CLIENT_ID not set: {}", e);
            AppError::InternalServerError
        })?;
    let github_client_secret = std::env::var("GITHUB_CLIENT_SECRET")
        .map_err(|e| {
            error!("GITHUB_CLIENT_SECRET not set: {}", e);
            AppError::InternalServerError
        })?;
    let github_redirect_uri = std::env::var("GITHUB_REDIRECT_URI")
        .map_err(|e| {
            error!("GITHUB_REDIRECT_URI not set: {}", e);
            AppError::InternalServerError
        })?;
    let frontend_url = std::env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:5173".to_string());
    
    debug!("Frontend URL: {}", frontend_url);

    let client = BasicClient::new(
        ClientId::new(github_client_id),
        Some(ClientSecret::new(github_client_secret)),
        AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
            .map_err(|_| AppError::InternalServerError)?,
        Some(
            TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
                .map_err(|_| AppError::InternalServerError)?,
        ),
    )
    .set_redirect_uri(
        RedirectUrl::new(github_redirect_uri)
            .map_err(|_| AppError::InternalServerError)?,
    );

    info!("Exchanging authorization code for access token");
    let token_result = client
        .exchange_code(AuthorizationCode::new(params.code))
        .request_async(async_http_client)
        .await
        .map_err(|e| {
            error!("Failed to exchange GitHub authorization code: {}", e);
            AppError::Unauthorized
        })?;

    info!("Successfully obtained access token, fetching user info from GitHub");
    let http_client = reqwest::Client::new();

    // Fetch user info from GitHub
    let user_info: GitHubUserInfo = http_client
        .get("https://api.github.com/user")
        .header("User-Agent", "CareerBridge")
        .bearer_auth(token_result.access_token().secret())
        .send()
        .await
        .map_err(|_| AppError::InternalServerError)?
        .json()
        .await
        .map_err(|e| {
            error!("Failed to parse GitHub user info JSON: {}", e);
            AppError::InternalServerError
        })?;

    info!("Retrieved GitHub user info: login={}, name={:?}", user_info.login, user_info.name);
    
    // Get email if not in profile
    let email = if let Some(email) = user_info.email.clone() {
        debug!("Email found in GitHub profile: {}", email);
        email
    } else {
        info!("Email not in profile, fetching from GitHub emails API");
        // Fetch emails from GitHub API
        let emails: Vec<GitHubEmail> = http_client
            .get("https://api.github.com/user/emails")
            .header("User-Agent", "CareerBridge")
            .bearer_auth(token_result.access_token().secret())
            .send()
            .await
            .map_err(|e| {
                error!("Failed to fetch emails from GitHub API: {}", e);
                AppError::InternalServerError
            })?
            .json()
            .await
            .map_err(|e| {
                error!("Failed to parse GitHub emails JSON: {}", e);
                AppError::InternalServerError
            })?;

        let primary_email = emails
            .into_iter()
            .find(|e| e.primary && e.verified)
            .map(|e| e.email)
            .ok_or_else(|| {
                warn!("No verified primary email found for GitHub user");
                AppError::Unauthorized
            })?;
        
        info!("Found verified primary email: {}", primary_email);
        primary_email
    };

    let oauth_user = OAuthUser {
        id: user_info.id.to_string(),
        email: email.clone(),
        name: user_info.name.clone().unwrap_or(user_info.login.clone()),
        avatar_url: user_info.avatar_url.clone(),
    };

    info!("Processing OAuth user authentication for GitHub ID: {}", user_info.id);
    let (user_id, is_new_user) = handle_oauth_user(&app_state, oauth_user, "github").await?;
    info!("Generating JWT token for user: {}, new_user={}", user_id, is_new_user);
    let token = create_jwt(user_id, format!("github_{}", user_id))?;

    let redirect_url = format!(
        "{}/auth/callback?token={}&new_user={}",
        frontend_url, token, is_new_user
    );
    info!("GitHub OAuth successful! Redirecting to frontend: {}", redirect_url);
    
    // Redirect to frontend with token
    Ok(Redirect::to(&redirect_url))
}

/// Helper function to create or retrieve OAuth user
async fn handle_oauth_user(
    app_state: &AppState,
    oauth_user: OAuthUser,
    provider: &str,
) -> AppResult<(Uuid, bool)> {
    info!("Handling OAuth user: provider={}, email={}, oauth_id={}", 
          provider, oauth_user.email, oauth_user.id);
    
    // Check if user exists with this OAuth ID
    debug!("Checking for existing user with OAuth provider and ID");
    let existing_user = sqlx::query!(
        r#"
        SELECT id FROM users 
        WHERE oauth_provider = $1 AND oauth_id = $2
        "#,
        provider,
        oauth_user.id
    )
    .fetch_optional(&app_state.db_pool)
    .await?;

    if let Some(user) = existing_user {
        info!("Found existing OAuth user: user_id={}", user.id);
        return Ok((user.id, false));
    }
    
    debug!("No existing OAuth user found, checking for email match");

    // Check if user exists with this email (link accounts)
    let existing_email_user = sqlx::query!(
        r#"
        SELECT id, oauth_provider FROM users 
        WHERE email = $1
        "#,
        oauth_user.email
    )
    .fetch_optional(&app_state.db_pool)
    .await?;

    if let Some(user) = existing_email_user {
        info!("Found existing user with matching email: user_id={}", user.id);
        
        // If user has no OAuth provider, link this one
        if user.oauth_provider.is_none() {
            info!("Linking OAuth account to existing email-based user: user_id={}", user.id);
            sqlx::query!(
                r#"
                UPDATE users 
                SET oauth_provider = $1, oauth_id = $2, avatar_url = $3
                WHERE id = $4
                "#,
                provider,
                oauth_user.id,
                oauth_user.avatar_url,
                user.id
            )
            .execute(&app_state.db_pool)
            .await?;
            
            info!("Successfully linked {} OAuth to user: user_id={}", provider, user.id);
            return Ok((user.id, false));
        }
        
        // User exists with different OAuth provider - treat as existing user
        info!("User already has OAuth provider: {:?}, treating as existing user", user.oauth_provider);
        return Ok((user.id, false));
    }

    // Create new user
    info!("Creating new user account via {} OAuth: email={}", provider, oauth_user.email);
    let user_id = sqlx::query_scalar!(
        r#"
        INSERT INTO users (
            full_name, email, password_hash, 
            oauth_provider, oauth_id, avatar_url
        )
        VALUES ($1, $2, '', $3, $4, $5)
        RETURNING id
        "#,
        oauth_user.name,
        oauth_user.email,
        provider,
        oauth_user.id,
        oauth_user.avatar_url
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    info!("Successfully created new user via {} OAuth: user_id={}", provider, user_id);
    Ok((user_id, true))
}
