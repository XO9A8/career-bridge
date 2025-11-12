use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};

use uuid::Uuid;

use crate::{
    middleware::AuthUser,
    models::{CreateJobRequest, Job, JobFilterParams, JobWithSkills},
    utils::{AppError, AppResult, AppState},
};

pub async fn get_jobs(
    State(state): State<AppState>,
    Query(params): Query<JobFilterParams>,
) -> AppResult<Json<Vec<JobWithSkills>>> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(10).min(50);
    let offset = (page - 1) * limit;

    let mut query = String::from(
        r#"
        SELECT DISTINCT
            j.id,
            j.title,
            j.company,
            j.location,
            j.job_type,
            j.salary_range,
            j.description,
            j.requirements,
            j.responsibilities,
            j.perks,
            j.experience_level,
            j.posted_date,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills
        FROM jobs j
        LEFT JOIN job_skills js ON j.id = js.job_id
        LEFT JOIN skills s ON js.skill_id = s.id
        WHERE j.is_active = true
        "#,
    );

    let mut conditions = Vec::new();

    if let Some(search) = &params.search {
        conditions.push(format!(
            "(j.title ILIKE '%{}%' OR j.company ILIKE '%{}%')",
            search, search
        ));
    }

    if let Some(location) = &params.location {
        conditions.push(format!("j.location ILIKE '%{}%'", location));
    }

    if let Some(job_type) = &params.job_type {
        conditions.push(format!("j.job_type = '{}'", job_type));
    }

    if let Some(exp_level) = &params.experience_level {
        conditions.push(format!("j.experience_level = '{}'", exp_level));
    }

    if !conditions.is_empty() {
        query.push_str(" AND ");
        query.push_str(&conditions.join(" AND "));
    }

    query.push_str(
        r#"
        GROUP BY j.id, j.title, j.company, j.location, j.job_type, j.salary_range, 
                 j.description, j.requirements, j.responsibilities, j.perks, 
                 j.experience_level, j.posted_date
        ORDER BY j.posted_date DESC
        LIMIT $1 OFFSET $2
        "#,
    );

    let jobs = sqlx::query_as::<_, JobWithSkills>(&query)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?;

    Ok(Json(jobs))
}

pub async fn get_job_by_id(
    State(state): State<AppState>,
    Path(job_id): Path<Uuid>,
) -> AppResult<Json<JobWithSkills>> {
    let job = sqlx::query_as::<_, JobWithSkills>(
        r#"
        SELECT 
            j.id,
            j.title,
            j.company,
            j.location,
            j.job_type,
            j.salary_range,
            j.description,
            j.requirements,
            j.responsibilities,
            j.perks,
            j.experience_level,
            j.posted_date,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills
        FROM jobs j
        LEFT JOIN job_skills js ON j.id = js.job_id
        LEFT JOIN skills s ON js.skill_id = s.id
        WHERE j.id = $1 AND j.is_active = true
        GROUP BY j.id
        "#,
    )
    .bind(job_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Job not found".to_string()))?;

    Ok(Json(job))
}

pub async fn get_recommended_jobs(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> AppResult<Json<Vec<JobWithSkills>>> {
    // Get jobs that match user's skills
    let jobs = sqlx::query_as::<_, JobWithSkills>(
        r#"
        WITH user_skill_ids AS (
            SELECT skill_id FROM user_skills WHERE user_id = $1
        ),
        job_matches AS (
            SELECT 
                j.id as job_id,
                COUNT(DISTINCT js.skill_id) as matching_skills,
                COUNT(DISTINCT CASE WHEN js.skill_id IN (SELECT skill_id FROM user_skill_ids) THEN js.skill_id END) as user_matching_skills
            FROM jobs j
            JOIN job_skills js ON j.id = js.job_id
            WHERE j.is_active = true
            GROUP BY j.id
        )
        SELECT 
            j.id,
            j.title,
            j.company,
            j.location,
            j.job_type,
            j.salary_range,
            j.description,
            j.requirements,
            j.responsibilities,
            j.perks,
            j.experience_level,
            j.posted_date,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills,
            ROUND((jm.user_matching_skills::DECIMAL / NULLIF(jm.matching_skills, 0) * 100)::NUMERIC, 2) as match_percentage
        FROM jobs j
        LEFT JOIN job_skills js ON j.id = js.job_id
        LEFT JOIN skills s ON js.skill_id = s.id
        LEFT JOIN job_matches jm ON j.id = jm.job_id
        WHERE j.is_active = true AND jm.user_matching_skills > 0
        GROUP BY j.id, jm.user_matching_skills, jm.matching_skills
        ORDER BY match_percentage DESC, j.posted_date DESC
        LIMIT 20
        "#
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(jobs))
}

pub async fn create_job(
    State(state): State<AppState>,
    Json(payload): Json<CreateJobRequest>,
) -> AppResult<Json<Job>> {
    let mut tx = state.pool.begin().await?;

    let job = sqlx::query_as::<_, Job>(
        r#"
        INSERT INTO jobs (
            id, title, company, location, job_type, salary_range, 
            description, requirements, responsibilities, perks, experience_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&payload.title)
    .bind(&payload.company)
    .bind(&payload.location)
    .bind(&payload.job_type)
    .bind(&payload.salary_range)
    .bind(&payload.description)
    .bind(&payload.requirements)
    .bind(&payload.responsibilities)
    .bind(&payload.perks)
    .bind(&payload.experience_level)
    .fetch_one(&mut *tx)
    .await?;

    // Add job skills
    for skill_id in &payload.skill_ids {
        sqlx::query(
            "INSERT INTO job_skills (id, job_id, skill_id, is_required) VALUES ($1, $2, $3, true)",
        )
        .bind(Uuid::new_v4())
        .bind(job.id)
        .bind(skill_id)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    Ok(Json(job))
}
