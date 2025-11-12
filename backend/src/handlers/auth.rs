use axum::{extract::State, Extension, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use uuid::Uuid;
use validator::Validate;

use crate::{
    middleware::AuthUser,
    models::{
        AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, User, UserResponse,
    },
    utils::{create_jwt, AppError, AppResult, AppState},
};

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if user already exists
    let existing_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::BadRequest("Email already registered".to_string()));
    }

    // Hash password
    let password_hash = hash(&payload.password, DEFAULT_COST)?;

    // Create new user
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (id, email, password_hash, full_name)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.full_name)
    .fetch_one(&state.pool)
    .await?;

    // Generate JWT token
    let token = create_jwt(
        user.id,
        user.email.clone(),
        &state.config.jwt_secret,
        state.config.jwt_expiration,
    )?;

    Ok(Json(AuthResponse {
        token,
        user: user.into(),
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Find user by email
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::Authentication("Invalid email or password".to_string()))?;

    // Verify password
    let is_valid = verify(&payload.password, &user.password_hash)?;

    if !is_valid {
        return Err(AppError::Authentication(
            "Invalid email or password".to_string(),
        ));
    }

    // Generate JWT token
    let token = create_jwt(
        user.id,
        user.email.clone(),
        &state.config.jwt_secret,
        state.config.jwt_expiration,
    )?;

    Ok(Json(AuthResponse {
        token,
        user: user.into(),
    }))
}

pub async fn get_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> AppResult<Json<UserResponse>> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(user.into()))
}

pub async fn update_profile(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<UpdateProfileRequest>,
) -> AppResult<Json<UserResponse>> {
    payload
        .validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let user = sqlx::query_as::<_, User>(
        r#"
        UPDATE users
        SET 
            full_name = COALESCE($2, full_name),
            phone = COALESCE($3, phone),
            location = COALESCE($4, location),
            bio = COALESCE($5, bio),
            github_url = COALESCE($6, github_url),
            linkedin_url = COALESCE($7, linkedin_url),
            portfolio_url = COALESCE($8, portfolio_url),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(auth_user.user_id)
    .bind(&payload.full_name)
    .bind(&payload.phone)
    .bind(&payload.location)
    .bind(&payload.bio)
    .bind(&payload.github_url)
    .bind(&payload.linkedin_url)
    .bind(&payload.portfolio_url)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(user.into()))
}
