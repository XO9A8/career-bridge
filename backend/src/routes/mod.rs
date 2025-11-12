use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};

use crate::{handlers, middleware::auth_middleware, utils::AppState};

pub fn create_router(state: AppState) -> Router {
    let protected_routes = Router::new()
        // Profile routes
        .route("/profile", get(handlers::get_profile))
        .route("/profile", post(handlers::update_profile))
        // User skills
        .route("/skills/me", get(handlers::get_user_skills))
        .route("/skills/me", post(handlers::add_user_skill))
        .route("/skills/me/:id", delete(handlers::remove_user_skill))
        // Recommended jobs
        .route("/jobs/recommended", get(handlers::get_recommended_jobs))
        // Recommended resources
        .route(
            "/resources/recommended",
            get(handlers::get_recommended_resources),
        )
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ));

    let public_routes = Router::new()
        // Auth routes
        .route("/auth/register", post(handlers::register))
        .route("/auth/login", post(handlers::login))
        // Skills routes
        .route("/skills", get(handlers::get_all_skills))
        .route("/skills", post(handlers::create_skill))
        // Jobs routes
        .route("/jobs", get(handlers::get_jobs))
        .route("/jobs/:id", get(handlers::get_job_by_id))
        .route("/jobs", post(handlers::create_job))
        // Resources routes
        .route("/resources", get(handlers::get_resources))
        .route("/resources/:id", get(handlers::get_resource_by_id))
        .route("/resources", post(handlers::create_resource));

    Router::new()
        .nest("/api", protected_routes.merge(public_routes))
        .with_state(state)
}
