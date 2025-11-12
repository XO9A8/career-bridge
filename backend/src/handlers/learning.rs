//! Learning resource and skill gap analysis handlers.

use axum::{extract::{State, Path}, Json};
use crate::models::{User, Job, LearningResource, ExperienceLevel, CareerTrack, JobType, CostIndicator};
use crate::errors::AppResult;
use crate::auth::AuthUser;
use crate::AppState;
use super::types::{ResourceRecommendation, SkillGapAnalysis};

/// Gets learning resource recommendations for the authenticated user.
/// 
/// Recommends resources that teach skills the user doesn't currently have.
/// Resources are scored based on how many new skills they offer.
/// 
/// # Returns
/// 
/// Up to 10 recommended learning resources sorted by relevance score.
/// Each recommendation includes:
/// - The resource details
/// - Relevance score
/// - Skills the resource can teach
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Database operation fails
pub async fn get_learning_recommendations(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Json<Vec<ResourceRecommendation>>> {
    // Get user profile
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, full_name, email, education_level,
            experience_level as "experience_level: ExperienceLevel",
            preferred_track as "preferred_track: CareerTrack",
            skills, projects, target_roles, raw_cv_text, password_hash
        FROM users 
        WHERE id = $1
        "#,
        auth_user.user_id
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    // Fetch all learning resources
    let resources = sqlx::query_as!(
        LearningResource,
        r#"
        SELECT 
            id, title, platform, url, related_skills,
            cost as "cost: CostIndicator"
        FROM learning_resources
        LIMIT 50
        "#
    )
    .fetch_all(&app_state.db_pool)
    .await?;

    // Calculate relevance scores
    let user_skills_set: std::collections::HashSet<_> = user.skills.iter().collect();

    let mut recommendations: Vec<ResourceRecommendation> = resources.into_iter()
        .map(|resource| {
            let resource_skills_set: std::collections::HashSet<_> = resource.related_skills.iter().collect();
            
            // Skills user doesn't have but resource teaches
            let new_skills: Vec<String> = resource_skills_set
                .difference(&user_skills_set)
                .map(|s| s.to_string())
                .collect();
            
            // Relevance based on how many new skills it teaches
            let relevance_score = if !resource.related_skills.is_empty() {
                (new_skills.len() as f64 / resource.related_skills.len() as f64) * 100.0
            } else {
                0.0
            };

            ResourceRecommendation {
                resource,
                relevance_score,
                target_skills: new_skills,
            }
        })
        .filter(|r| r.relevance_score > 0.0) // Only show resources that teach new skills
        .collect();

    recommendations.sort_by(|a, b| b.relevance_score.partial_cmp(&a.relevance_score).unwrap());

    Ok(Json(recommendations.into_iter().take(10).collect()))
}

/// Analyzes skill gaps for a target role.
/// 
/// Compares the user's skills against requirements for a specific job role,
/// identifying which skills they have and which they need to acquire.
/// 
/// # Path Parameters
/// 
/// - `target_role` - The job title to analyze (partial match supported)
/// 
/// # Returns
/// 
/// A detailed skill gap analysis including:
/// - User's current skills
/// - All required skills for the role
/// - Skill gaps (what's missing)
/// - Matching skills (what user already has)
/// - Match percentage
/// - Recommended learning resources to close gaps
/// 
/// # Errors
/// 
/// Returns an error if:
/// - User is not authenticated
/// - Database operation fails
pub async fn analyze_skill_gap(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Path(target_role): Path<String>,
) -> AppResult<Json<SkillGapAnalysis>> {
    // Get user profile
    let user = sqlx::query_as!(
        User,
        r#"
        SELECT 
            id, full_name, email, education_level,
            experience_level as "experience_level: ExperienceLevel",
            preferred_track as "preferred_track: CareerTrack",
            skills, projects, target_roles, raw_cv_text, password_hash
        FROM users 
        WHERE id = $1
        "#,
        auth_user.user_id
    )
    .fetch_one(&app_state.db_pool)
    .await?;

    // Find jobs matching the target role
    let jobs = sqlx::query_as!(
        Job,
        r#"
        SELECT 
            id, job_title, company, location, required_skills,
            experience_level as "experience_level: ExperienceLevel",
            job_type as "job_type: JobType"
        FROM jobs 
        WHERE LOWER(job_title) LIKE LOWER($1)
        LIMIT 5
        "#,
        format!("%{}%", target_role)
    )
    .fetch_all(&app_state.db_pool)
    .await?;

    // Aggregate all required skills from matching jobs
    let mut all_required_skills = std::collections::HashSet::new();
    for job in &jobs {
        for skill in &job.required_skills {
            all_required_skills.insert(skill.clone());
        }
    }

    let required_skills: Vec<String> = all_required_skills.into_iter().collect();
    let user_skills_set: std::collections::HashSet<_> = user.skills.iter().cloned().collect();
    let required_skills_set: std::collections::HashSet<_> = required_skills.iter().cloned().collect();

    let matching_skills: Vec<String> = user_skills_set
        .intersection(&required_skills_set)
        .cloned()
        .collect();

    let skill_gaps: Vec<String> = required_skills_set
        .difference(&user_skills_set)
        .cloned()
        .collect();

    let match_percentage = if !required_skills.is_empty() {
        (matching_skills.len() as f64 / required_skills.len() as f64) * 100.0
    } else {
        0.0
    };

    // Find resources for skill gaps
    let recommended_resources = if !skill_gaps.is_empty() {
        sqlx::query_as!(
            LearningResource,
            r#"
            SELECT 
                id, title, platform, url, related_skills,
                cost as "cost: CostIndicator"
            FROM learning_resources
            WHERE related_skills && $1
            LIMIT 10
            "#,
            &skill_gaps
        )
        .fetch_all(&app_state.db_pool)
        .await?
    } else {
        vec![]
    };

    Ok(Json(SkillGapAnalysis {
        user_skills: user.skills,
        target_role,
        required_skills,
        skill_gaps,
        matching_skills,
        match_percentage,
        recommended_resources,
    }))
}
