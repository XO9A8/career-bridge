//! AI-powered action handlers.
//!
//! Provides endpoints for AI-powered features like skill extraction,
//! roadmap generation, and more.

use axum::{Json, extract::State};
use serde_json::json;

use crate::{
    AppState,
    ai::types::{AIActionRequest, AIActionResponse},
    auth::AuthUser,
    errors::AppError,
};

/// Process an AI action
///
/// # Endpoint
/// `POST /api/ai/action`
///
/// # Request Body
/// ```json
/// {
///   "action": "extract_skills",
///   "provider": "gemini",
///   "input": "CV text here...",
///   "parameters": {
///     "optional": "parameters"
///   }
/// }
/// ```
///
/// # Actions
/// - `extract_skills`: Extract skills from CV/profile text
/// - `generate_roadmap`: Generate learning roadmap for tech stack
/// - `ask_question`: Ask career-related questions
/// - `generate_content`: Generate career content (cover letters, etc.)
///
/// # Providers
/// - `gemini`: Google Gemini API (default)
/// - `groq`: Groq API
pub async fn process_ai_action(
    _auth_user: AuthUser,
    State(state): State<AppState>,
    Json(request): Json<AIActionRequest>,
) -> Result<Json<AIActionResponse>, AppError> {
    tracing::info!(
        "Processing AI action: {:?} with provider: {:?}",
        request.action,
        request.provider
    );

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(request).await?;

    Ok(Json(response))
}

/// Extract skills from CV and update user profile
///
/// # Endpoint
/// `POST /api/ai/extract-skills`
///
/// # Request Body
/// ```json
/// {
///   "cv_text": "Your CV content here...",
///   "provider": "gemini",
///   "update_profile": true
/// }
/// ```
pub async fn extract_and_save_skills(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let cv_text = payload
        .get("cv_text")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::ValidationError("cv_text is required".to_string()))?;

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    let update_profile = payload
        .get("update_profile")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    // Create AI action request
    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::ExtractSkills,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: cv_text.to_string(),
        parameters: None,
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    tracing::info!("Calling AI service to extract skills, update_profile={}", update_profile);
    let response = ai_service.process_action(ai_request).await?;

    tracing::info!("AI response received, success={}", response.success);
    
    if !response.success {
        tracing::error!("AI extraction failed: {:?}", response.message);
        return Err(AppError::ExternalServiceError(
            response
                .message
                .unwrap_or_else(|| "AI extraction failed".to_string()),
        ));
    }

    // Extract the skills from the response
    let extracted_data = &response.data;
    tracing::info!("Full AI response data: {}", serde_json::to_string_pretty(extracted_data).unwrap_or_default());

    // If update_profile is true, update the user's profile
    if update_profile {
        tracing::info!("Starting profile update with extracted data");
        
        // Extract technical skills - handle both object format and string array format
        let technical_skills: Vec<String> = extracted_data
            .get("technical_skills")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|skill| {
                        // Try to get as object with "name" field
                        if let Some(name) = skill.get("name").and_then(|n| n.as_str()) {
                            Some(name.to_string())
                        }
                        // Fallback: try as plain string
                        else if let Some(name) = skill.as_str() {
                            Some(name.to_string())
                        } else {
                            None
                        }
                    })
                    .collect()
            })
            .unwrap_or_default();

        tracing::info!("Extracted {} technical skills: {:?}", technical_skills.len(), technical_skills);

        // Extract roles
        let roles: Vec<String> = extracted_data
            .get("roles")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|r| r.as_str())
                    .map(String::from)
                    .collect()
            })
            .unwrap_or_default();

        tracing::info!("Extracted {} roles: {:?}", roles.len(), roles);

        // Combine existing skills with new ones (avoid duplicates)
        let user_id = auth_user.user_id;
        let existing_user =
            sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
                .bind(&user_id)
                .fetch_one(&state.db_pool)
                .await?;

        tracing::info!("Existing user skills before update: {:?}", existing_user.skills);
        tracing::info!("Existing user roles before update: {:?}", existing_user.target_roles);

        let mut combined_skills = existing_user.skills.clone();
        for skill in technical_skills {
            if !combined_skills.contains(&skill) {
                combined_skills.push(skill);
            }
        }

        let mut combined_roles = existing_user.target_roles.clone();
        for role in roles {
            if !combined_roles.contains(&role) {
                combined_roles.push(role);
            }
        }

        tracing::info!("Combined skills to save: {:?} (total: {})", combined_skills, combined_skills.len());
        tracing::info!("Combined roles to save: {:?} (total: {})", combined_roles, combined_roles.len());

        // Update user profile with extracted skills and roles
        let result = sqlx::query(
            "UPDATE users 
             SET skills = $1, 
                 target_roles = $2, 
                 raw_cv_text = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4",
        )
        .bind(&combined_skills)
        .bind(&combined_roles)
        .bind(cv_text)
        .bind(&user_id)
        .execute(&state.db_pool)
        .await?;

        tracing::info!(
            "Updated user profile with extracted skills for user: {}. Rows affected: {}",
            user_id,
            result.rows_affected()
        );
    }

    Ok(Json(json!({
        "success": true,
        "extracted_data": extracted_data,
        "profile_updated": update_profile,
        "message": "Skills extracted successfully"
    })))
}

/// Generate a personalized learning roadmap
///
/// # Endpoint
/// `POST /api/ai/roadmap`
///
/// # Request Body
/// ```json
/// {
///   "target_role": "Full Stack Developer",
///   "timeframe_months": 6,
///   "learning_hours_per_week": 10,
///   "provider": "gemini",
///   "include_current_skills": true
/// }
/// ```
pub async fn generate_roadmap(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let target_role = payload
        .get("target_role")
        .or_else(|| payload.get("tech_stack"))
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::ValidationError("target_role is required".to_string()))?;

    let timeframe_months = payload
        .get("timeframe_months")
        .and_then(|v| v.as_u64())
        .map(|t| t as u32)
        .unwrap_or(6);

    let learning_hours_per_week = payload
        .get("learning_hours_per_week")
        .and_then(|v| v.as_u64())
        .map(|h| h as u32)
        .unwrap_or(10);

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    let include_current_skills = payload
        .get("include_current_skills")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    // Get user's current skills if requested
    let (current_skills, user_skills_json) = if include_current_skills {
        let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
            .bind(auth_user.user_id)
            .fetch_one(&state.db_pool)
            .await?;

        let skills_str = user.skills.join(", ");
        let skills_json = serde_json::to_value(&user.skills).unwrap_or(json!([]));
        (Some(skills_str), skills_json)
    } else {
        (None, json!([]))
    };

    // Create AI action request with comprehensive parameters
    let mut parameters = serde_json::Map::new();
    if let Some(ref skills) = current_skills {
        parameters.insert("current_skills".to_string(), json!(skills));
    }
    parameters.insert("timeframe_months".to_string(), json!(timeframe_months));
    parameters.insert("learning_hours_per_week".to_string(), json!(learning_hours_per_week));

    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::GenerateRoadmap,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: target_role.to_string(),
        parameters: Some(serde_json::Value::Object(parameters)),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    if !response.success {
        return Err(AppError::ExternalServiceError(
            response.message.unwrap_or_else(|| "Roadmap generation failed".to_string())
        ));
    }

    // Extract project suggestions and job application timing from AI response
    let project_suggestions = response.data.get("project_suggestions")
        .cloned()
        .unwrap_or(json!([]));
    
    let job_application_timing = response.data.get("job_application_timing")
        .and_then(|v| v.as_str())
        .unwrap_or("Apply after completing 60-70% of the roadmap");

    // Save roadmap to database with enhanced fields
    let provider_string = match response.provider {
        crate::ai::types::AIProvider::Gemini => "gemini",
        crate::ai::types::AIProvider::Groq => "groq",
    };

    let roadmap_id = sqlx::query_scalar::<_, i32>(
        "INSERT INTO career_roadmaps (
            user_id, title, target_role, roadmap_data, ai_provider,
            timeframe_months, learning_hours_per_week, current_skills,
            project_suggestions, job_application_timing
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id",
    )
    .bind(auth_user.user_id)
    .bind(format!("Roadmap to {}", target_role))
    .bind(target_role)
    .bind(&response.data)
    .bind(provider_string)
    .bind(timeframe_months as i32)
    .bind(learning_hours_per_week as i32)
    .bind(&user_skills_json)
    .bind(&project_suggestions)
    .bind(job_application_timing)
    .fetch_one(&state.db_pool)
    .await?;

    Ok(Json(json!({
        "success": true,
        "roadmap": response.data,
        "roadmap_id": roadmap_id,
        "provider": response.provider,
        "message": "Roadmap generated and saved successfully",
        "metadata": {
            "timeframe_months": timeframe_months,
            "learning_hours_per_week": learning_hours_per_week,
            "job_application_timing": job_application_timing
        }
    })))
}

/// Generate professional summary for CV/profile
///
/// # Endpoint
/// `POST /api/ai/generate-summary`
///
/// # Request Body
/// ```json
/// {
///   "profile_data": {
///     "skills": ["React", "Node.js"],
///     "experience": "2 years",
///     "target_role": "Full Stack Developer"
///   },
///   "provider": "gemini"
/// }
/// ```
pub async fn generate_professional_summary(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    // Get user profile
    let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_one(&state.db_pool)
        .await?;

    // Build context from user profile
    let context = format!(
        "User Profile:\nSkills: {}\nProjects: {}\nTarget Roles: {}\nEducation: {}\nExperience Level: {:?}",
        user.skills.join(", "),
        user.projects.join(", "),
        user.target_roles.join(", "),
        user.education_level.as_deref().unwrap_or("Not specified"),
        user.experience_level
    );

    let prompt = format!(
        "Generate a professional summary for a CV/LinkedIn profile based on the following information:\n\n{}\n\nCreate a compelling 2-3 sentence professional summary that highlights key strengths, experience, and career goals. Make it engaging and professional.",
        context
    );

    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::GenerateContent,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: prompt,
        parameters: Some(json!({
            "content_type": "professional_summary",
            "tone": "professional",
            "length": "short"
        })),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    Ok(Json(json!({
        "success": response.success,
        "summary": response.data,
        "provider": response.provider
    })))
}

/// Improve project descriptions with AI
///
/// # Endpoint
/// `POST /api/ai/improve-projects`
///
/// # Request Body
/// ```json
/// {
///   "projects": ["Built a todo app", "Created a website"],
///   "provider": "gemini"
/// }
/// ```
pub async fn improve_project_descriptions(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let projects = payload
        .get("projects")
        .and_then(|v| v.as_array())
        .ok_or_else(|| AppError::ValidationError("projects array is required".to_string()))?;

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    // Get user skills for context
    let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_one(&state.db_pool)
        .await?;

    let projects_text = projects
        .iter()
        .filter_map(|p| p.as_str())
        .collect::<Vec<_>>()
        .join("\n- ");

    let prompt = format!(
        "Improve these project descriptions for a professional CV. Make them more impactful using action verbs and quantifiable achievements where possible. User's skills: {}\n\nProjects:\n- {}\n\nReturn a JSON array of improved descriptions in the same order.",
        user.skills.join(", "),
        projects_text
    );

    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::GenerateContent,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: prompt,
        parameters: Some(json!({
            "content_type": "project_descriptions",
            "format": "bullet_points"
        })),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    Ok(Json(json!({
        "success": response.success,
        "improved_projects": response.data,
        "provider": response.provider
    })))
}

/// Get LinkedIn/portfolio improvement suggestions
///
/// # Endpoint
/// `POST /api/ai/profile-suggestions`
///
/// # Request Body
/// ```json
/// {
///   "platform": "linkedin",
///   "provider": "gemini"
/// }
/// ```
pub async fn get_profile_suggestions(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let platform = payload
        .get("platform")
        .and_then(|v| v.as_str())
        .unwrap_or("linkedin");

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    // Get user profile
    let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_one(&state.db_pool)
        .await?;

    let prompt = format!(
        "Provide 5 specific, actionable suggestions to improve a {} profile for a job seeker with the following background:\n\nSkills: {}\nTarget Roles: {}\nExperience Level: {:?}\nEducation: {}\n\nReturn suggestions as a JSON array of objects with 'category' and 'suggestion' fields.",
        platform,
        user.skills.join(", "),
        user.target_roles.join(", "),
        user.experience_level,
        user.education_level.as_deref().unwrap_or("Not specified")
    );

    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::GenerateContent,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: prompt,
        parameters: Some(json!({
            "content_type": "profile_suggestions",
            "platform": platform
        })),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    Ok(Json(json!({
        "success": response.success,
        "suggestions": response.data,
        "platform": platform,
        "provider": response.provider
    })))
}

/// Career chatbot - ask career-related questions
///
/// # Endpoint
/// `POST /api/ai/ask-mentor`
///
/// # Request Body
/// ```json
/// {
///   "question": "What should I learn to become a backend developer?",
///   "provider": "gemini"
/// }
/// ```
pub async fn ask_career_mentor(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let question = payload
        .get("question")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::ValidationError("question is required".to_string()))?;

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    // Get user context
    let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_one(&state.db_pool)
        .await?;

    let context = format!(
        "User's current skills: {}\nTarget roles: {}\nExperience level: {:?}",
        user.skills.join(", "),
        user.target_roles.join(", "),
        user.experience_level
    );

    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::AskQuestion,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: question.to_string(),
        parameters: Some(json!({ "context": context })),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    Ok(Json(json!({
        "success": response.success,
        "answer": response.data,
        "provider": response.provider
    })))
}

/// Enhanced career mentor with intelligent context awareness
///
/// # Endpoint
/// `POST /api/ai/enhanced-mentor`
///
/// # Request Body
/// ```json
/// {
///   "question": "What skills should I learn?",
///   "provider": "gemini",
///   "include_skill_gap": true,
///   "include_market_analysis": true,
///   "include_cv_data": true,
///   "target_role": "Full Stack Developer"
/// }
/// ```
pub async fn enhanced_career_mentor(
    auth_user: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let question = payload
        .get("question")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::ValidationError("question is required".to_string()))?;

    let provider_str = payload
        .get("provider")
        .and_then(|v| v.as_str())
        .unwrap_or("gemini");

    let include_skill_gap = payload
        .get("include_skill_gap")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let include_market_analysis = payload
        .get("include_market_analysis")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let include_cv_data = payload
        .get("include_cv_data")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let target_role = payload
        .get("target_role")
        .and_then(|v| v.as_str());

    // Check if user is asking for direct database statistics
    let question_lower = question.to_lowercase();
    let is_db_stats_query = question_lower.contains("how many") || 
                           question_lower.contains("database") ||
                           question_lower.contains("total") ||
                           question_lower.contains("count");

    // Check if asking about skill gaps/match scores
    let is_skill_query = question_lower.contains("skill") && 
                         (question_lower.contains("match") || 
                          question_lower.contains("gap") ||
                          question_lower.contains("score") ||
                          question_lower.contains("percentage") ||
                          question_lower.contains("of the role") ||
                          question_lower.contains("for the role") ||
                          question_lower.contains("for a role"));

    // If asking about database stats, always include market analysis to get counts
    let include_market_analysis = include_market_analysis || is_db_stats_query;
    
    // If asking about skill match/gap, always include skill gap analysis
    let include_skill_gap = include_skill_gap || is_skill_query;

    tracing::info!(
        "Enhanced mentor request from user {}: skill_gap={}, market={}, cv={}, role={:?}, is_skill_query={}",
        auth_user.user_id, include_skill_gap, include_market_analysis, include_cv_data, target_role, is_skill_query
    );

    // Get user profile
    let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_one(&state.db_pool)
        .await?;

    let mut context_parts = vec![
        format!("User Profile:\n- Name: {}", user.full_name),
        format!("- Current Skills: {}", user.skills.join(", ")),
        format!("- Target Roles: {}", user.target_roles.join(", ")),
        format!("- Experience Level: {:?}", user.experience_level),
        format!("- Projects: {}", user.projects.join(", ")),
    ];

    // Add skill gap analysis if requested
    if include_skill_gap {
        // Extract role from target_role parameter or question or user profile
        let role_to_analyze = if let Some(role) = target_role {
            // If target_role looks like a full question, extract the role from it
            if role.to_lowercase().contains("skill") || role.to_lowercase().contains("what") {
                // Common role keywords to search for in the string
                let role_keywords = [
                    "data analyst", "data scientist", "backend developer", "frontend developer",
                    "full stack developer", "software engineer", "web developer", "devops engineer",
                    "machine learning engineer", "ui/ux designer", "product manager", "react developer",
                    "java developer", "python developer", "node developer", "angular developer"
                ];
                
                let role_lower = role.to_lowercase();
                role_keywords.iter()
                    .find(|&&keyword| role_lower.contains(keyword))
                    .map(|&s| s)
                    .or_else(|| user.target_roles.first().map(|s| s.as_str()))
                    .unwrap_or("Software Developer")
            } else {
                role
            }
        } else {
            // Try to extract from the question itself
            let role_keywords = [
                "data analyst", "data scientist", "backend developer", "frontend developer",
                "full stack developer", "software engineer", "web developer", "devops engineer",
                "machine learning engineer", "ui/ux designer", "product manager", "react developer",
                "java developer", "python developer", "node developer", "angular developer"
            ];
            
            let question_lower = question.to_lowercase();
            role_keywords.iter()
                .find(|&&keyword| question_lower.contains(keyword))
                .map(|&s| s)
                .or_else(|| user.target_roles.first().map(|s| s.as_str()))
                .unwrap_or("Software Developer")
        };

        tracing::info!("Analyzing skill gap for role: {}", role_to_analyze);

        // Find jobs matching target role - use broader search pattern
        // Split role into words for flexible matching (e.g., "full stack" matches "Full Stack Developer")
        let search_pattern = role_to_analyze
            .split_whitespace()
            .next()
            .unwrap_or(role_to_analyze);
            
        tracing::info!("Searching for jobs with pattern: '{}'", search_pattern);
            
        let jobs = sqlx::query!(
            r#"
            SELECT required_skills
            FROM jobs
            WHERE LOWER(job_title) LIKE LOWER($1)
            LIMIT 10
            "#,
            format!("%{}%", search_pattern)
        )
        .fetch_all(&state.db_pool)
        .await?;
        
        tracing::info!("Found {} jobs matching pattern '{}'", jobs.len(), search_pattern);

        if !jobs.is_empty() {
            // Aggregate required skills
            let mut all_required_skills = std::collections::HashSet::new();
            for job in &jobs {
                for skill in &job.required_skills {
                    all_required_skills.insert(skill.clone());
                }
            }

            let required_skills: Vec<String> = all_required_skills.into_iter().collect();

            // Calculate gaps (case-insensitive)
            let user_skills_lower: std::collections::HashSet<String> = user.skills
                .iter()
                .map(|s| s.to_lowercase())
                .collect();
            let required_skills_lower: std::collections::HashMap<String, String> = required_skills
                .iter()
                .map(|s| (s.to_lowercase(), s.clone()))
                .collect();
            let required_skills_set: std::collections::HashSet<String> = 
                required_skills_lower.keys().cloned().collect();

            let matching_skills: Vec<String> = user_skills_lower
                .intersection(&required_skills_set)
                .filter_map(|lower_key| required_skills_lower.get(lower_key).cloned())
                .collect();

            let skill_gaps: Vec<String> = required_skills_set
                .difference(&user_skills_lower)
                .filter_map(|lower_key| required_skills_lower.get(lower_key).cloned())
                .collect();

            let match_percentage = if !required_skills.is_empty() {
                (matching_skills.len() as f64 / required_skills.len() as f64) * 100.0
            } else {
                0.0
            };

            tracing::info!(
                "Skill gap calculation: {} matching / {} required = {:.1}%",
                matching_skills.len(), required_skills.len(), match_percentage
            );

            context_parts.push(format!(
                "\nSkill Gap Analysis for '{}':\n- Match Percentage: {:.1}%\n- Matching Skills ({}/{}): {}\n- Skills to Learn: {}",
                role_to_analyze,
                match_percentage,
                matching_skills.len(),
                required_skills.len(),
                if matching_skills.is_empty() { "None yet".to_string() } else { matching_skills.join(", ") },
                if skill_gaps.is_empty() { "None - you're ready!".to_string() } else { skill_gaps.join(", ") }
            ));
        } else {
            context_parts.push(format!(
                "\nSkill Gap Analysis: No jobs found for '{}' in our database. Consider asking about similar roles.",
                role_to_analyze
            ));
            
            // Suggest available job titles
            let sample_titles = sqlx::query_scalar::<_, String>(
                "SELECT DISTINCT job_title FROM jobs LIMIT 10"
            )
            .fetch_all(&state.db_pool)
            .await?;
            
            if !sample_titles.is_empty() {
                context_parts.push(format!(
                    "Available job roles in database: {}",
                    sample_titles.join(", ")
                ));
            }
        }
    }

    // Add market analysis if requested
    if include_market_analysis {
        tracing::info!("Performing market analysis");

        // Get total job count
        let total_jobs = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM jobs")
            .fetch_one(&state.db_pool)
            .await?;

        // Get total learning resources count
        let total_resources = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM learning_resources")
            .fetch_one(&state.db_pool)
            .await?;

        // Get total users count
        let total_users = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users")
            .fetch_one(&state.db_pool)
            .await?;

        context_parts.push(format!(
            "\nDatabase Statistics:\n- Total Jobs: {}\n- Total Learning Resources: {}\n- Total Users: {}",
            total_jobs, total_resources, total_users
        ));

        // Get sample learning resources to show what's available
        let sample_resources = sqlx::query!(
            r#"
            SELECT title, platform, related_skills, cost as "cost: crate::models::CostIndicator"
            FROM learning_resources
            LIMIT 50
            "#
        )
        .fetch_all(&state.db_pool)
        .await?;

        if !sample_resources.is_empty() {
            let resource_list: Vec<String> = sample_resources
                .iter()
                .map(|r| {
                    let skills = r.related_skills.join(", ");
                    format!("'{}' (Platform: {}, Skills: {}, Cost: {:?})", 
                        r.title, r.platform, skills, r.cost)
                })
                .collect();
            
            context_parts.push(format!(
                "- Sample Learning Resources:\n  {}", 
                resource_list.join("\n  ")
            ));
        }

        // Get unique companies count
        let total_companies = sqlx::query_scalar::<_, i64>("SELECT COUNT(DISTINCT company) FROM jobs")
            .fetch_one(&state.db_pool)
            .await?;

        context_parts.push(format!("- Unique Companies: {}", total_companies));

        // Get experience level breakdown
        let exp_breakdown = sqlx::query!(
            r#"
            SELECT experience_level as "experience_level: crate::models::ExperienceLevel", COUNT(*) as count
            FROM jobs
            GROUP BY experience_level
            ORDER BY count DESC
            "#
        )
        .fetch_all(&state.db_pool)
        .await?;

        if !exp_breakdown.is_empty() {
            let exp_dist: Vec<String> = exp_breakdown
                .iter()
                .map(|row| format!("{:?}: {}", row.experience_level, row.count.unwrap_or(0)))
                .collect();
            
            context_parts.push(format!("- By Experience Level: {}", exp_dist.join(", ")));
        }

        // Get most in-demand skills from all jobs
        let skill_demand = sqlx::query!(
            r#"
            SELECT unnest(required_skills) as skill, COUNT(*) as demand_count
            FROM jobs
            GROUP BY skill
            ORDER BY demand_count DESC
            LIMIT 15
            "#
        )
        .fetch_all(&state.db_pool)
        .await?;

        if !skill_demand.is_empty() {
            let top_skills: Vec<String> = skill_demand
                .iter()
                .map(|row| format!("{} ({} jobs)", row.skill.as_deref().unwrap_or("Unknown"), row.demand_count.unwrap_or(0)))
                .collect();

            context_parts.push(format!(
                "\nCurrent Market Trends (Based on Job Database):\n- Most In-Demand Skills: {}",
                top_skills.join(", ")
            ));

            // Identify trending skills user doesn't have
            let user_skills_lower: std::collections::HashSet<String> = user.skills
                .iter()
                .map(|s| s.to_lowercase())
                .collect();

            let missing_trending_skills: Vec<String> = skill_demand
                .iter()
                .filter_map(|row| {
                    let skill = row.skill.as_deref()?;
                    if !user_skills_lower.contains(&skill.to_lowercase()) {
                        Some(format!("{} ({} jobs)", skill, row.demand_count.unwrap_or(0)))
                    } else {
                        None
                    }
                })
                .take(10)
                .collect();

            if !missing_trending_skills.is_empty() {
                context_parts.push(format!(
                    "- Trending Skills You Should Consider Learning: {}",
                    missing_trending_skills.join(", ")
                ));
            }
        }

        // Get job type distribution
        let job_types = sqlx::query!(
            r#"
            SELECT job_type as "job_type: crate::models::JobType", COUNT(*) as count
            FROM jobs
            GROUP BY job_type
            ORDER BY count DESC
            "#
        )
        .fetch_all(&state.db_pool)
        .await?;

        if !job_types.is_empty() {
            let type_dist: Vec<String> = job_types
                .iter()
                .map(|row| format!("{:?}: {}", row.job_type, row.count.unwrap_or(0)))
                .collect();

            context_parts.push(format!(
                "- Job Market Distribution: {}",
                type_dist.join(", ")
            ));
        }
    }

    // Add CV data if requested and available
    if include_cv_data && user.raw_cv_text.is_some() {
        let cv_length = user.raw_cv_text.as_ref().map(|cv| cv.len()).unwrap_or(0);
        context_parts.push(format!(
            "\nCV Data: User has uploaded a CV ({} characters). Can extract skills using /api/ai/extract-skills endpoint.",
            cv_length
        ));
    }

    // Get user's job applications for additional context
    let applications = sqlx::query!(
        r#"
        SELECT COUNT(*) as app_count, status
        FROM application_tracking
        WHERE user_id = $1
        GROUP BY status
        "#,
        auth_user.user_id
    )
    .fetch_all(&state.db_pool)
    .await?;

    if !applications.is_empty() {
        let app_summary: Vec<String> = applications
            .iter()
            .map(|row| format!("{}: {}", row.status, row.app_count.unwrap_or(0)))
            .collect();

        context_parts.push(format!(
            "\nJob Applications: {}",
            app_summary.join(", ")
        ));
    }

    let full_context = context_parts.join("\n");

    tracing::debug!("Generated context for AI:\n{}", full_context);

    // Build enhanced prompt that forces AI to use exact numbers from context
    let enhanced_prompt = if include_skill_gap {
        format!(
            "IMPORTANT: The context below contains the user's ACTUAL skill gap analysis with match percentage. Use these EXACT numbers.\n\n{}\n\nQuestion: {}\n\nAnswer with the specific match percentage and skill gaps shown in the context above. Be direct and cite the exact numbers provided.",
            full_context, question
        )
    } else if include_market_analysis {
        format!(
            "IMPORTANT: The context below contains ACTUAL DATA from our database. Use ONLY these exact numbers and resource names. Do NOT make up or estimate any statistics.\n\nWhen the user asks about resources, jobs, or statistics, refer to the specific data provided below.\n\n{}\n\nQuestion: {}\n\nAnswer based on the data above. If asking about learning resources, reference the actual resource titles and platforms shown above.",
            full_context, question
        )
    } else {
        format!(
            "Based on the following user context, answer their question:\n\n{}\n\nQuestion: {}",
            full_context, question
        )
    };

    // Call AI service with enhanced context
    let ai_request = AIActionRequest {
        action: crate::ai::types::ActionType::AskQuestion,
        provider: if provider_str == "groq" {
            crate::ai::types::AIProvider::Groq
        } else {
            crate::ai::types::AIProvider::Gemini
        },
        input: enhanced_prompt,
        parameters: Some(json!({
            "context": full_context,
            "enhanced": true,
            "include_skill_gap": include_skill_gap,
            "include_market_analysis": include_market_analysis
        })),
    };

    let ai_service = state
        .ai_service
        .as_ref()
        .ok_or_else(|| AppError::ConfigurationError("AI service not configured".to_string()))?;

    let response = ai_service.process_action(ai_request).await?;

    // Extract the answer string from the response data
    let answer_text = if let Some(answer_str) = response.data.get("answer").and_then(|a| a.as_str()) {
        answer_str.to_string()
    } else {
        // Fallback: try to get the whole data as string or serialize it
        response.data.as_str()
            .map(|s| s.to_string())
            .unwrap_or_else(|| serde_json::to_string_pretty(&response.data).unwrap_or_default())
    };

    Ok(Json(json!({
        "success": response.success,
        "answer": answer_text,
        "provider": response.provider,
        "context_included": {
            "skill_gap": include_skill_gap,
            "market_analysis": include_market_analysis,
            "cv_data": include_cv_data
        }
    })))
}

/// Get all saved roadmaps for the logged-in user
///
/// # Endpoint
/// `GET /api/ai/roadmaps`
pub async fn get_my_roadmaps(
    auth_user: AuthUser,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let roadmaps = sqlx::query!(
        "SELECT id, title, target_role, roadmap_data, ai_provider, 
                timeframe_months, learning_hours_per_week, current_skills,
                project_suggestions, job_application_timing, 
                progress_percentage, completed_phases, notes,
                created_at, updated_at 
         FROM career_roadmaps 
         WHERE user_id = $1 
         ORDER BY created_at DESC",
        auth_user.user_id
    )
    .fetch_all(&state.db_pool)
    .await?;

    let roadmaps_json: Vec<serde_json::Value> = roadmaps
        .into_iter()
        .map(|r| {
            json!({
                "id": r.id,
                "title": r.title,
                "target_role": r.target_role,
                "roadmap": r.roadmap_data,
                "ai_provider": r.ai_provider,
                "timeframe_months": r.timeframe_months,
                "learning_hours_per_week": r.learning_hours_per_week,
                "current_skills": r.current_skills,
                "project_suggestions": r.project_suggestions,
                "job_application_timing": r.job_application_timing,
                "progress_percentage": r.progress_percentage,
                "completed_phases": r.completed_phases,
                "notes": r.notes,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            })
        })
        .collect();

    Ok(Json(json!({
        "success": true,
        "roadmaps": roadmaps_json,
        "count": roadmaps_json.len()
    })))
}

/// Get a specific roadmap by ID
///
/// # Endpoint
/// `GET /api/ai/roadmaps/:id`
pub async fn get_roadmap_by_id(
    auth_user: AuthUser,
    State(state): State<AppState>,
    axum::extract::Path(roadmap_id): axum::extract::Path<i32>,
) -> Result<Json<serde_json::Value>, AppError> {
    let roadmap = sqlx::query!(
        "SELECT id, title, target_role, roadmap_data, ai_provider,
                timeframe_months, learning_hours_per_week, current_skills,
                project_suggestions, job_application_timing,
                progress_percentage, completed_phases, notes,
                created_at, updated_at 
         FROM career_roadmaps 
         WHERE id = $1 AND user_id = $2",
        roadmap_id,
        auth_user.user_id
    )
    .fetch_optional(&state.db_pool)
    .await?;

    match roadmap {
        Some(r) => Ok(Json(json!({
            "success": true,
            "roadmap": {
                "id": r.id,
                "title": r.title,
                "target_role": r.target_role,
                "roadmap": r.roadmap_data,
                "ai_provider": r.ai_provider,
                "timeframe_months": r.timeframe_months,
                "learning_hours_per_week": r.learning_hours_per_week,
                "current_skills": r.current_skills,
                "project_suggestions": r.project_suggestions,
                "job_application_timing": r.job_application_timing,
                "progress_percentage": r.progress_percentage,
                "completed_phases": r.completed_phases,
                "notes": r.notes,
                "created_at": r.created_at,
                "updated_at": r.updated_at
            }
        }))),
        None => Err(AppError::NotFound),
    }
}

/// Delete a roadmap by ID
///
/// # Endpoint
/// `DELETE /api/ai/roadmaps/:id`
pub async fn delete_roadmap(
    auth_user: AuthUser,
    State(state): State<AppState>,
    axum::extract::Path(roadmap_id): axum::extract::Path<i32>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query!(
        "DELETE FROM career_roadmaps WHERE id = $1 AND user_id = $2",
        roadmap_id,
        auth_user.user_id
    )
    .execute(&state.db_pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(json!({
        "success": true,
        "message": "Roadmap deleted successfully"
    })))
}

/// Update roadmap progress
///
/// # Endpoint
/// `PUT /api/ai/roadmaps/:id/progress`
///
/// # Request Body
/// ```json
/// {
///   "progress_percentage": 45,
///   "completed_phases": [1, 2],
///   "notes": "Completed first two phases, starting phase 3"
/// }
/// ```
pub async fn update_roadmap_progress(
    auth_user: AuthUser,
    State(state): State<AppState>,
    axum::extract::Path(roadmap_id): axum::extract::Path<i32>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    let progress_percentage = payload
        .get("progress_percentage")
        .and_then(|v| v.as_i64())
        .map(|p| p as i32);

    let completed_phases: Option<Vec<i32>> = payload
        .get("completed_phases")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|p| p.as_i64())
                .map(|p| p as i32)
                .collect()
        });

    let notes = payload
        .get("notes")
        .and_then(|v| v.as_str());

    // Build dynamic update query
    let mut update_fields = Vec::new();
    let mut query = String::from("UPDATE career_roadmaps SET updated_at = CURRENT_TIMESTAMP");
    
    if let Some(progress) = progress_percentage {
        if progress < 0 || progress > 100 {
            return Err(AppError::ValidationError("Progress percentage must be between 0 and 100".to_string()));
        }
        update_fields.push(format!(" progress_percentage = {}", progress));
    }
    
    if completed_phases.is_some() {
        update_fields.push(" completed_phases = $3".to_string());
    }
    
    if notes.is_some() {
        update_fields.push(" notes = $4".to_string());
    }

    if !update_fields.is_empty() {
        query.push_str(", ");
        query.push_str(&update_fields.join(", "));
    }

    query.push_str(" WHERE id = $1 AND user_id = $2 RETURNING id");

    // Execute update
    let result = if let Some(phases) = completed_phases {
        if let Some(note_text) = notes {
            sqlx::query_scalar::<_, i32>(&query)
                .bind(roadmap_id)
                .bind(auth_user.user_id)
                .bind(&phases)
                .bind(note_text)
                .fetch_optional(&state.db_pool)
                .await?
        } else {
            let query_no_notes = query.replace(", notes = $4", "");
            sqlx::query_scalar::<_, i32>(&query_no_notes)
                .bind(roadmap_id)
                .bind(auth_user.user_id)
                .bind(&phases)
                .fetch_optional(&state.db_pool)
                .await?
        }
    } else if let Some(note_text) = notes {
        let query_no_phases = query.replace(", completed_phases = $3", "");
        sqlx::query_scalar::<_, i32>(&query_no_phases)
            .bind(roadmap_id)
            .bind(auth_user.user_id)
            .bind(note_text)
            .fetch_optional(&state.db_pool)
            .await?
    } else {
        // Only progress percentage
        let simple_query = "UPDATE career_roadmaps SET progress_percentage = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id";
        sqlx::query_scalar::<_, i32>(simple_query)
            .bind(roadmap_id)
            .bind(auth_user.user_id)
            .bind(progress_percentage.unwrap_or(0))
            .fetch_optional(&state.db_pool)
            .await?
    };

    match result {
        Some(_) => Ok(Json(json!({
            "success": true,
            "message": "Roadmap progress updated successfully"
        }))),
        None => Err(AppError::NotFound),
    }
}
