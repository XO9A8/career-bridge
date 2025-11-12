use axum::{extract::{Path, Query, State}, Extension, Json};

use uuid::Uuid;

use crate::{
    middleware::AuthUser,
    models::{CreateResourceRequest, LearningResource, LearningResourceWithSkill, ResourceFilterParams},
    utils::{AppError, AppResult, AppState},
};

pub async fn get_resources(
    State(state): State<AppState>,
    Query(params): Query<ResourceFilterParams>,
) -> AppResult<Json<Vec<LearningResourceWithSkill>>> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(10).min(50);
    let offset = (page - 1) * limit;

    let mut query = String::from(
        r#"
        SELECT 
            lr.id,
            lr.title,
            lr.description,
            lr.resource_type,
            lr.provider,
            lr.url,
            lr.difficulty_level,
            lr.duration_hours,
            lr.cost,
            lr.price,
            lr.rating,
            lr.thumbnail_url,
            s.name as skill_name
        FROM learning_resources lr
        LEFT JOIN skills s ON lr.skill_id = s.id
        WHERE lr.is_active = true
        "#
    );

    let mut conditions = Vec::new();

    if let Some(search) = &params.search {
        conditions.push(format!("(lr.title ILIKE '%{}%' OR lr.description ILIKE '%{}%')", search, search));
    }

    if let Some(skill_id) = &params.skill_id {
        conditions.push(format!("lr.skill_id = '{}'", skill_id));
    }

    if let Some(resource_type) = &params.resource_type {
        conditions.push(format!("lr.resource_type = '{}'", resource_type));
    }

    if let Some(difficulty) = &params.difficulty_level {
        conditions.push(format!("lr.difficulty_level = '{}'", difficulty));
    }

    if let Some(cost) = &params.cost {
        conditions.push(format!("lr.cost = '{}'", cost));
    }

    if !conditions.is_empty() {
        query.push_str(" AND ");
        query.push_str(&conditions.join(" AND "));
    }

    query.push_str(" ORDER BY lr.rating DESC NULLS LAST, lr.created_at DESC LIMIT $1 OFFSET $2");

    let resources = sqlx::query_as::<_, LearningResourceWithSkill>(&query)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(resources))
}

pub async fn get_resource_by_id(
    State(state): State<AppState>,
    Path(resource_id): Path<Uuid>,
) -> AppResult<Json<LearningResourceWithSkill>> {
    let resource = sqlx::query_as::<_, LearningResourceWithSkill>(
        r#"
        SELECT 
            lr.id,
            lr.title,
            lr.description,
            lr.resource_type,
            lr.provider,
            lr.url,
            lr.difficulty_level,
            lr.duration_hours,
            lr.cost,
            lr.price,
            lr.rating,
            lr.thumbnail_url,
            s.name as skill_name
        FROM learning_resources lr
        LEFT JOIN skills s ON lr.skill_id = s.id
        WHERE lr.id = $1 AND lr.is_active = true
        "#
    )
    .bind(resource_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Resource not found".to_string()))?;

    Ok(Json(resource))
}

pub async fn get_recommended_resources(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> AppResult<Json<Vec<LearningResourceWithSkill>>> {
    // Get resources for skills the user has or might need for their target jobs
    let resources = sqlx::query_as::<_, LearningResourceWithSkill>(
        r#"
        WITH user_skill_ids AS (
            SELECT skill_id FROM user_skills WHERE user_id = $1
        )
        SELECT 
            lr.id,
            lr.title,
            lr.description,
            lr.resource_type,
            lr.provider,
            lr.url,
            lr.difficulty_level,
            lr.duration_hours,
            lr.cost,
            lr.price,
            lr.rating,
            lr.thumbnail_url,
            s.name as skill_name
        FROM learning_resources lr
        JOIN skills s ON lr.skill_id = s.id
        WHERE lr.is_active = true 
        AND lr.skill_id IN (SELECT skill_id FROM user_skill_ids)
        ORDER BY lr.rating DESC NULLS LAST, lr.created_at DESC
        LIMIT 20
        "#
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(resources))
}

pub async fn create_resource(
    State(state): State<AppState>,
    Json(payload): Json<CreateResourceRequest>,
) -> AppResult<Json<LearningResource>> {
    let resource = sqlx::query_as::<_, LearningResource>(
        r#"
        INSERT INTO learning_resources (
            id, title, description, resource_type, provider, url,
            difficulty_level, duration_hours, cost, price, rating, 
            thumbnail_url, skill_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
        "#
    )
    .bind(Uuid::new_v4())
    .bind(&payload.title)
    .bind(&payload.description)
    .bind(&payload.resource_type)
    .bind(&payload.provider)
    .bind(&payload.url)
    .bind(&payload.difficulty_level)
    .bind(payload.duration_hours)
    .bind(&payload.cost)
    .bind(&payload.price)
    .bind(payload.rating)
    .bind(&payload.thumbnail_url)
    .bind(payload.skill_id)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(resource))
}
