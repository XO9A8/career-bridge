//! Job recommendation handlers.

use axum::{extract::{State, Query}, Json};
use tracing::{info, debug};
use crate::models::{User, Job, ExperienceLevel, CareerTrack, JobType};
use crate::errors::AppResult;
use crate::auth::AuthUser;
use crate::AppState;
use super::types::{JobQueryParams, JobRecommendation};

/// Gets job recommendations for the authenticated user.
/// 
/// Retrieves jobs matching user's experience level (or specified level) and
/// calculates match scores based on skill overlap.
/// 
/// # Query Parameters
/// 
/// - `experience_level` - Optional filter by experience level
/// - `job_type` - Optional filter by job type
/// - `limit` - Maximum results to return (default: 10)
/// 
/// # Returns
/// 
/// A list of job recommendations sorted by match score (highest first).
/// Each recommendation includes:
/// - The job details
/// - Match score percentage
/// - Matched skills
/// - Missing skills
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Database operation fails
pub async fn get_job_recommendations(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Query(params): Query<JobQueryParams>,
) -> AppResult<Json<Vec<JobRecommendation>>> {
    info!("Fetching job recommendations for user: {}", auth_user.user_id);
    debug!("Query params: experience_level={:?}, limit={:?}", 
           params.experience_level, params.limit);
    
    // Get user profile
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, full_name, email, education_level,
            experience_level as "experience_level: ExperienceLevel",
            preferred_track as "preferred_track: CareerTrack",
            profile_completed as "profile_completed!",
            skills, projects, target_roles, raw_cv_text, password_hash
        FROM users 
        WHERE id = $1
        "#,
        auth_user.user_id
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    // Fetch jobs matching criteria
    let limit = params.limit.unwrap_or(10);
    
    let jobs = if let Some(exp_level) = params.experience_level {
        sqlx::query_as!(
            Job,
            r#"
            SELECT 
                id, job_title, company, location, job_description, required_skills,
                experience_level as "experience_level: ExperienceLevel",
                job_type as "job_type: JobType",
                salary_min, salary_max
            FROM jobs 
            WHERE experience_level = $1
            LIMIT $2
            "#,
            exp_level as _,
            limit
        )
        .fetch_all(&app_state.db_pool)
        .await?
    } else if let Some(user_exp_level) = user.experience_level {
        sqlx::query_as!(
            Job,
            r#"
            SELECT 
                id, job_title, company, location, job_description, required_skills,
                experience_level as "experience_level: ExperienceLevel",
                job_type as "job_type: JobType",
                salary_min, salary_max
            FROM jobs 
            WHERE experience_level = $1
            LIMIT $2
            "#,
            user_exp_level as _,
            limit
        )
        .fetch_all(&app_state.db_pool)
        .await?
    } else {
        // If user hasn't completed profile, return all jobs
        sqlx::query_as!(
            Job,
            r#"
            SELECT 
                id, job_title, company, location, job_description, required_skills,
                experience_level as "experience_level: ExperienceLevel",
                job_type as "job_type: JobType",
                salary_min, salary_max
            FROM jobs 
            LIMIT $1
            "#,
            limit
        )
        .fetch_all(&app_state.db_pool)
        .await?
    };

    // Calculate match scores
    let mut recommendations: Vec<JobRecommendation> = jobs.into_iter()
        .map(|job| {
            let user_skills_set: std::collections::HashSet<_> = user.skills.iter().collect();
            let job_skills_set: std::collections::HashSet<_> = job.required_skills.iter().collect();
            
            let matched: Vec<String> = user_skills_set
                .intersection(&job_skills_set)
                .map(|s| s.to_string())
                .collect();
            
            let missing: Vec<String> = job_skills_set
                .difference(&user_skills_set)
                .map(|s| s.to_string())
                .collect();
            
            let match_score = if !job.required_skills.is_empty() {
                (matched.len() as f64 / job.required_skills.len() as f64) * 100.0
            } else {
                0.0
            };

            JobRecommendation {
                job,
                match_score,
                matched_skills: matched,
                missing_skills: missing,
            }
        })
        .collect();

    // Sort by match score descending
    recommendations.sort_by(|a, b| b.match_score.partial_cmp(&a.match_score).unwrap());

    info!("Returning {} job recommendations for user: {}", 
          recommendations.len(), auth_user.user_id);
    if !recommendations.is_empty() {
        debug!("Top match score: {:.1}%", recommendations[0].match_score);
    }
    
    Ok(Json(recommendations))
}
