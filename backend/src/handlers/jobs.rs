//! Job recommendation handlers.

use super::types::{JobQueryParams, JobRecommendation, PlatformLinks};
use crate::AppState;
use crate::ai_matching::{calculate_enhanced_match, generate_ai_explanation};
use crate::auth::AuthUser;
use crate::errors::AppResult;
use crate::models::{CareerTrack, ExperienceLevel, Job, JobType, User};
use axum::{
    Json,
    extract::{Query, State},
};
use tracing::{debug, info};

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
    info!(
        "Fetching job recommendations for user: {}",
        auth_user.user_id
    );
    debug!(
        "Query params: experience_level={:?}, limit={:?}",
        params.experience_level, params.limit
    );

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
    let limit = params.limit.unwrap_or(50);

    // Fetch all jobs (no longer filtering by experience level to show all available jobs)
    // Match scoring will prioritize jobs that match user's experience level
    let jobs = if let Some(exp_level) = params.experience_level {
        // If explicitly filtered by experience level, honor that filter
        sqlx::query_as!(
            Job,
            r#"
            SELECT 
                id, job_title, company, location, job_description, required_skills,
                experience_level as "experience_level: ExperienceLevel",
                job_type as "job_type: JobType",
                salary_min, salary_max, responsibilities, requirements, benefits
            FROM jobs 
            WHERE experience_level = $1
            LIMIT $2
            "#,
            exp_level as _,
            limit
        )
        .fetch_all(&app_state.db_pool)
        .await?
    } else {
        // Otherwise, return all jobs regardless of user's experience level
        // Match scoring will rank them appropriately
        sqlx::query_as!(
            Job,
            r#"
            SELECT 
                id, job_title, company, location, job_description, required_skills,
                experience_level as "experience_level: ExperienceLevel",
                job_type as "job_type: JobType",
                salary_min, salary_max, responsibilities, requirements, benefits
            FROM jobs 
            LIMIT $1
            "#,
            limit
        )
        .fetch_all(&app_state.db_pool)
        .await?
    };

    // Calculate match scores
    let mut recommendations: Vec<JobRecommendation> = Vec::new();

    for job in jobs {
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

        // Calculate enhanced match using heuristic
        let enhanced = calculate_enhanced_match(
            &user.skills,
            &job.required_skills,
            user.experience_level.as_ref().map(|e| match e {
                ExperienceLevel::Fresher => "fresher",
                ExperienceLevel::Junior => "junior",
                ExperienceLevel::Mid => "mid",
            }),
            match job.experience_level {
                ExperienceLevel::Fresher => "fresher",
                ExperienceLevel::Junior => "junior",
                ExperienceLevel::Mid => "mid",
            },
            user.preferred_track.as_ref().map(|t| match t {
                CareerTrack::WebDevelopment => "web_development",
                CareerTrack::Data => "data",
                CareerTrack::Design => "design",
                CareerTrack::Marketing => "marketing",
            }),
            &job.job_title,
        );

        // Try to enhance explanation with AI (falls back to heuristic if AI fails)
        let ai_enhanced_explanation = generate_ai_explanation(
            &user.skills,
            &job.required_skills,
            user.experience_level.as_ref().map(|e| match e {
                ExperienceLevel::Fresher => "fresher",
                ExperienceLevel::Junior => "junior",
                ExperienceLevel::Mid => "mid",
            }),
            match job.experience_level {
                ExperienceLevel::Fresher => "fresher",
                ExperienceLevel::Junior => "junior",
                ExperienceLevel::Mid => "mid",
            },
            user.preferred_track.as_ref().map(|t| match t {
                CareerTrack::WebDevelopment => "web_development",
                CareerTrack::Data => "data",
                CareerTrack::Design => "design",
                CareerTrack::Marketing => "marketing",
            }),
            &job.job_title,
            &job.job_description,
            enhanced.match_score,
            enhanced.skill_overlap,
            enhanced.experience_alignment,
            enhanced.track_alignment,
        )
        .await;

        // Generate platform links
        let encoded_title = urlencoding::encode(&job.job_title);
        let encoded_location = urlencoding::encode(&job.location);

        let platform_links = PlatformLinks {
            linkedin: format!(
                "https://www.linkedin.com/jobs/search/?keywords={}&location={}",
                encoded_title, encoded_location
            ),
            bdjobs: format!(
                "https://jobs.bdjobs.com/jobsearch.asp?txtKeyword={}&fcatId=8",
                encoded_title
            ),
            glassdoor: format!(
                "https://www.glassdoor.com/Job/jobs.htm?sc.keyword={}",
                encoded_title
            ),
            indeed: format!(
                "https://www.indeed.com/jobs?q={}&l={}",
                encoded_title, encoded_location
            ),
            rojgari: None,
        };

        recommendations.push(JobRecommendation {
            job,
            match_score: enhanced.match_score,
            matched_skills: matched,
            missing_skills: missing,
            match_explanation: ai_enhanced_explanation,
            strengths: enhanced.strengths,
            improvement_areas: enhanced.improvement_areas,
            experience_alignment: enhanced.experience_alignment,
            track_alignment: enhanced.track_alignment,
            skill_overlap: enhanced.skill_overlap,
            platform_links,
        });
    }

    // Note: We don't filter by minimum match score to allow users to see all available jobs
    // Even with low match scores, users can still apply and learn from job requirements

    // Sort by match score descending
    recommendations.sort_by(|a, b| b.match_score.partial_cmp(&a.match_score).unwrap());

    info!(
        "Returning {} job recommendations for user: {}",
        recommendations.len(),
        auth_user.user_id
    );
    if !recommendations.is_empty() {
        debug!("Top match score: {:.1}%", recommendations[0].match_score);
    }

    Ok(Json(recommendations))
}
