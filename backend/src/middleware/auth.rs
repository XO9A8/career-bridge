use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

use crate::utils::{verify_jwt, AppError, AppState};

use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub email: String,
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .ok_or_else(|| AppError::Authentication("Missing authorization header".to_string()))?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        AppError::Authentication("Invalid authorization header format".to_string())
    })?;

    let claims = verify_jwt(token, &state.config.jwt_secret)?;

    let user_id = Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Authentication("Invalid user ID in token".to_string()))?;

    let auth_user = AuthUser {
        user_id,
        email: claims.email,
    };

    req.extensions_mut().insert(auth_user);

    Ok(next.run(req).await)
}
