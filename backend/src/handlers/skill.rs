use axum::{
    extract::{Path, State},
    Extension, Json,
};
use uuid::Uuid;

use crate::{
    middleware::AuthUser,
    models::{AddUserSkillRequest, CreateSkillRequest, Skill, UserSkillWithDetails},
    utils::{AppError, AppResult, AppState},
};

pub async fn get_all_skills(State(state): State<AppState>) -> AppResult<Json<Vec<Skill>>> {
    let skills = sqlx::query_as::<_, Skill>("SELECT * FROM skills ORDER BY name ASC")
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(skills))
}

pub async fn create_skill(
    State(state): State<AppState>,
    Json(payload): Json<CreateSkillRequest>,
) -> AppResult<Json<Skill>> {
    let skill = sqlx::query_as::<_, Skill>(
        r#"
        INSERT INTO skills (id, name, category, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&payload.name)
    .bind(&payload.category)
    .bind(&payload.description)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(skill))
}

pub async fn get_user_skills(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> AppResult<Json<Vec<UserSkillWithDetails>>> {
    let skills = sqlx::query_as::<_, UserSkillWithDetails>(
        r#"
        SELECT 
            us.id,
            us.skill_id,
            s.name as skill_name,
            s.category,
            us.proficiency_level,
            us.years_of_experience
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = $1
        ORDER BY s.name ASC
        "#,
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(skills))
}

pub async fn add_user_skill(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(payload): Json<AddUserSkillRequest>,
) -> AppResult<Json<UserSkillWithDetails>> {
    // Verify skill exists
    let skill_exists =
        sqlx::query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM skills WHERE id = $1)")
            .bind(payload.skill_id)
            .fetch_one(&state.pool)
            .await?;

    if !skill_exists {
        return Err(AppError::NotFound("Skill not found".to_string()));
    }

    // Check if user already has this skill
    let existing = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM user_skills WHERE user_id = $1 AND skill_id = $2)",
    )
    .bind(auth_user.user_id)
    .bind(payload.skill_id)
    .fetch_one(&state.pool)
    .await?;

    if existing {
        return Err(AppError::BadRequest("Skill already added".to_string()));
    }

    // Add user skill
    sqlx::query(
        r#"
        INSERT INTO user_skills (id, user_id, skill_id, proficiency_level, years_of_experience)
        VALUES ($1, $2, $3, $4, $5)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(auth_user.user_id)
    .bind(payload.skill_id)
    .bind(&payload.proficiency_level)
    .bind(payload.years_of_experience)
    .execute(&state.pool)
    .await?;

    // Fetch the added skill with details
    let skill = sqlx::query_as::<_, UserSkillWithDetails>(
        r#"
        SELECT 
            us.id,
            us.skill_id,
            s.name as skill_name,
            s.category,
            us.proficiency_level,
            us.years_of_experience
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = $1 AND us.skill_id = $2
        "#,
    )
    .bind(auth_user.user_id)
    .bind(payload.skill_id)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(skill))
}

pub async fn remove_user_skill(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(user_skill_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let result = sqlx::query("DELETE FROM user_skills WHERE id = $1 AND user_id = $2")
        .bind(user_skill_id)
        .bind(auth_user.user_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("User skill not found".to_string()));
    }

    Ok(Json(serde_json::json!({
        "message": "Skill removed successfully"
    })))
}
