//! User profile management handlers.

use super::types::{UpdateProfilePayload, UserProfile};
use crate::AppState;
use crate::auth::AuthUser;
use crate::errors::{AppError, AppResult};
use crate::models::{CareerTrack, ExperienceLevel, User};
use axum::{
    Json,
    extract::{Multipart, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};
use printpdf::*;
use std::io::Write;
use tempfile::NamedTempFile;
use tracing::{debug, error, info, warn};
use validator::Validate;

/// Retrieves the authenticated user's profile.
///
/// Returns user profile information including `profile_completed` flag.
/// Frontend can use this to show onboarding prompts if needed.
///
/// # Errors
///
/// Returns an error if:
/// - User is not authenticated
/// - User not found in database
/// - Database operation fails
pub async fn get_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Json<UserProfile>> {
    info!("Fetching profile for user: {}", auth_user.user_id);

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
    .fetch_optional(&app_state.db_pool)
    .await?
    .ok_or_else(|| {
        error!("User profile not found: {}", auth_user.user_id);
        AppError::NotFound
    })?;

    debug!(
        "Profile retrieved: user_id={}, profile_completed={}",
        user.id, user.profile_completed
    );

    Ok(Json(UserProfile {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        profile_completed: user.profile_completed,
        education_level: user.education_level,
        experience_level: user.experience_level,
        preferred_track: user.preferred_track,
        skills: user.skills,
        projects: user.projects,
        target_roles: user.target_roles,
    }))
}

/// Completes the user's profile after initial registration (onboarding step).
///
/// This is the second step in the user onboarding flow. After registering with
/// just name, email, and password, users call this endpoint to provide:
/// - Education level
/// - Experience level (required)
/// - Preferred career track (required)
/// - Skills, projects, and target roles (optional)
///
/// Sets `profile_completed = TRUE` to indicate the user has finished onboarding.
///
/// # Errors
///
/// Returns an error if:
/// - User is not authenticated
/// - Validation fails (missing required fields)
/// - Database operation fails
pub async fn complete_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Json(payload): Json<super::types::CompleteProfilePayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Completing profile for user: {}", auth_user.user_id);

    payload.validate().map_err(|e| {
        warn!(
            "Profile completion validation failed for user {}: {}",
            auth_user.user_id, e
        );
        e
    })?;

    debug!(
        "Profile data: experience_level={:?}, preferred_track={:?}",
        payload.experience_level, payload.preferred_track
    );

    sqlx::query!(
        r#"
        UPDATE users 
        SET education_level = $1,
            experience_level = $2,
            preferred_track = $3,
            skills = $4,
            projects = $5,
            target_roles = $6,
            profile_completed = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        "#,
        payload.education_level,
        payload.experience_level as _,
        payload.preferred_track as _,
        &payload.skills.unwrap_or_default(),
        &payload.projects.unwrap_or_default(),
        &payload.target_roles.unwrap_or_default(),
        auth_user.user_id
    )
    .execute(&app_state.db_pool)
    .await
    .map_err(|e| {
        error!(
            "Failed to complete profile for user {}: {}",
            auth_user.user_id, e
        );
        e
    })?;

    info!(
        "Profile completed successfully for user: {}",
        auth_user.user_id
    );

    Ok(Json(serde_json::json!({
        "message": "Profile completed successfully"
    })))
}

/// Updates the authenticated user's profile after onboarding.
///
/// Allows users to modify their profile information after completing onboarding.
/// Updates only the fields provided in the payload. Omitted fields remain unchanged.
/// Can update experience level, preferred track, and all other profile fields.
///
/// # Errors
///
/// Returns an error if:
/// - User is not authenticated
/// - Validation fails
/// - Database operation fails
pub async fn update_profile(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    Json(payload): Json<UpdateProfilePayload>,
) -> AppResult<Json<serde_json::Value>> {
    info!("Updating profile for user: {}", auth_user.user_id);

    payload.validate().map_err(|e| {
        warn!(
            "Profile update validation failed for user {}: {}",
            auth_user.user_id, e
        );
        e
    })?;

    let mut updated_fields = Vec::new();

    // Simple approach: update each field if provided
    if let Some(full_name) = payload.full_name {
        debug!("Updating full_name for user: {}", auth_user.user_id);
        updated_fields.push("full_name");
        sqlx::query!(
            "UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            full_name,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(education_level) = payload.education_level {
        updated_fields.push("education_level");
        sqlx::query!(
            "UPDATE users SET education_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            education_level,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(experience_level) = payload.experience_level {
        updated_fields.push("experience_level");
        sqlx::query!(
            "UPDATE users SET experience_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            experience_level as _,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(preferred_track) = payload.preferred_track {
        updated_fields.push("preferred_track");
        sqlx::query!(
            "UPDATE users SET preferred_track = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            preferred_track as _,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(skills) = payload.skills {
        updated_fields.push("skills");
        sqlx::query!(
            "UPDATE users SET skills = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            &skills,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(projects) = payload.projects {
        updated_fields.push("projects");
        sqlx::query!(
            "UPDATE users SET projects = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            &projects,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(target_roles) = payload.target_roles {
        updated_fields.push("target_roles");
        sqlx::query!(
            "UPDATE users SET target_roles = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            &target_roles,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }
    if let Some(raw_cv_text) = payload.raw_cv_text {
        updated_fields.push("raw_cv_text");
        sqlx::query!(
            "UPDATE users SET raw_cv_text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            raw_cv_text,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await?;
    }

    info!(
        "Profile updated successfully for user {}: fields updated: {:?}",
        auth_user.user_id, updated_fields
    );

    Ok(Json(serde_json::json!({
        "message": "Profile updated successfully"
    })))
}

/// Uploads and processes a CV/resume PDF file.
///
/// Accepts a PDF file via multipart form upload, extracts the text content,
/// and saves it to the user's profile as `raw_cv_text`.
///
/// # File Requirements
///
/// - Format: PDF only
/// - Max size: 10MB
/// - Field name: `cv_file`
///
/// # Errors
///
/// Returns an error if:
/// - User is not authenticated
/// - File is not a PDF
/// - File exceeds size limit
/// - PDF text extraction fails
/// - Database operation fails
pub async fn upload_cv(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
    mut multipart: Multipart,
) -> AppResult<Json<serde_json::Value>> {
    info!("Processing CV upload for user: {}", auth_user.user_id);

    const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB

    // Process multipart form
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        error!("Failed to read multipart field: {}", e);
        AppError::BadRequest("Invalid multipart data".to_string())
    })? {
        let field_name = field.name().unwrap_or("").to_string();

        if field_name != "cv_file" {
            continue;
        }

        // Get filename
        let file_name = field
            .file_name()
            .ok_or_else(|| {
                warn!(
                    "CV upload failed: no filename provided for user {}",
                    auth_user.user_id
                );
                AppError::BadRequest("No filename provided".to_string())
            })?
            .to_string();

        debug!("Uploaded file: {}", file_name);

        // Verify it's a PDF file
        if !file_name.to_lowercase().ends_with(".pdf") {
            warn!(
                "CV upload failed: invalid file type '{}' for user {}",
                file_name, auth_user.user_id
            );
            return Err(AppError::BadRequest(
                "Only PDF files are supported".to_string(),
            ));
        }

        // Read file data
        let file_data = field.bytes().await.map_err(|e| {
            error!("Failed to read file data: {}", e);
            AppError::BadRequest("Failed to read file data".to_string())
        })?;

        debug!("File size: {} bytes", file_data.len());

        // Check file size
        if file_data.len() > MAX_FILE_SIZE {
            warn!(
                "CV upload failed: file too large ({} bytes) for user {}",
                file_data.len(),
                auth_user.user_id
            );
            return Err(AppError::BadRequest(
                "File size exceeds 10MB limit".to_string(),
            ));
        }

        // Verify PDF header (should start with %PDF)
        if file_data.len() < 5 || !file_data.starts_with(b"%PDF") {
            error!(
                "Invalid PDF header for user {}. First bytes: {:?}",
                auth_user.user_id,
                &file_data.get(0..10)
            );
            return Err(AppError::BadRequest(
                "Invalid PDF file. The file may be corrupted or not a valid PDF.".to_string(),
            ));
        }

        // Create a temporary file to write the PDF data
        let mut temp_file = NamedTempFile::new().map_err(|e| {
            error!(
                "Failed to create temporary file for user {}: {}",
                auth_user.user_id, e
            );
            AppError::InternalServerError
        })?;

        temp_file.write_all(&file_data).map_err(|e| {
            error!(
                "Failed to write PDF data for user {}: {}",
                auth_user.user_id, e
            );
            AppError::InternalServerError
        })?;

        // Flush to ensure all data is written
        temp_file.flush().map_err(|e| {
            error!(
                "Failed to flush PDF data for user {}: {}",
                auth_user.user_id, e
            );
            AppError::InternalServerError
        })?;

        let temp_path = temp_file.path();

        // Extract text from PDF
        let extracted_text = pdf_extract::extract_text(temp_path).map_err(|e| {
            error!(
                "PDF text extraction failed for user {}: {}",
                auth_user.user_id, e
            );
            AppError::BadRequest(format!("Failed to extract text from PDF: {}", e))
        })?;

        debug!("Extracted {} characters from PDF", extracted_text.len());

        if extracted_text.trim().is_empty() {
            warn!(
                "CV upload: extracted text is empty for user {}",
                auth_user.user_id
            );
            return Err(AppError::BadRequest(
                "PDF appears to be empty or contains no extractable text".to_string(),
            ));
        }

        // Save extracted text to database
        sqlx::query!(
            "UPDATE users SET raw_cv_text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            extracted_text,
            auth_user.user_id
        )
        .execute(&app_state.db_pool)
        .await
        .map_err(|e| {
            error!(
                "Failed to save CV text for user {}: {}",
                auth_user.user_id, e
            );
            e
        })?;

        info!(
            "CV uploaded and processed successfully for user: {}",
            auth_user.user_id
        );

        return Ok(Json(serde_json::json!({
            "message": "CV uploaded and processed successfully",
            "extracted_length": extracted_text.len()
        })));
    }

    // If we get here, no cv_file field was found
    warn!(
        "CV upload failed: no cv_file field found for user {}",
        auth_user.user_id
    );
    Err(AppError::BadRequest(
        "No cv_file field found in request".to_string(),
    ))
}

/// Generates a PDF CV based on the user's profile data.
///
/// Creates a professional CV document using the user's profile information including:
/// - Full name and email
/// - Education level
/// - Experience level and preferred career track
/// - Skills
/// - Projects
/// - Target roles
///
/// Returns the PDF as a downloadable file.
///
/// # Errors
///
/// Returns an error if:
/// - User is not authenticated
/// - User profile not found
/// - PDF generation fails
pub async fn generate_cv(
    auth_user: AuthUser,
    State(app_state): State<AppState>,
) -> AppResult<Response> {
    info!("Generating CV for user: {}", auth_user.user_id);

    // Fetch user profile
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
    .fetch_optional(&app_state.db_pool)
    .await?
    .ok_or_else(|| {
        error!("User not found for CV generation: {}", auth_user.user_id);
        AppError::NotFound
    })?;

    debug!("Generating CV for: {}", user.full_name);

    // Create PDF document
    let (doc, page1, layer1) = PdfDocument::new(
        &format!("{}_CV", user.full_name.replace(' ', "_")),
        Mm(210.0), // A4 width
        Mm(297.0), // A4 height
        "Layer 1",
    );

    let font = doc.add_builtin_font(BuiltinFont::Helvetica).map_err(|e| {
        error!("Failed to add font: {}", e);
        AppError::InternalServerError
    })?;
    let font_bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| {
            error!("Failed to add bold font: {}", e);
            AppError::InternalServerError
        })?;

    let current_layer = doc.get_page(page1).get_layer(layer1);

    let mut y_position = 270.0; // Start from top (A4 is 297mm high)
    let left_margin = 20.0;
    let line_height = 6.0;

    // Helper function to add text
    let add_text = |text: &str, font_ref: &IndirectFontRef, size: f32, y: &mut f32| {
        current_layer.use_text(text, size, Mm(left_margin), Mm(*y), font_ref);
        *y -= line_height;
    };

    // Helper function to add bold heading
    let add_heading = |text: &str, y: &mut f32| {
        current_layer.use_text(text, 16.0, Mm(left_margin), Mm(*y), &font_bold);
        *y -= line_height * 1.5;
    };

    let add_section_title = |text: &str, y: &mut f32| {
        *y -= 3.0; // Extra spacing before sections
        current_layer.use_text(text, 14.0, Mm(left_margin), Mm(*y), &font_bold);
        *y -= line_height * 1.2;
    };

    // Title - Name
    add_heading(&user.full_name, &mut y_position);

    // Contact Information
    add_text(&user.email, &font, 11.0, &mut y_position);

    // Education & Experience
    add_section_title("Education & Experience", &mut y_position);
    if let Some(edu) = &user.education_level {
        add_text(&format!("Education: {}", edu), &font, 11.0, &mut y_position);
    }
    add_text(
        &format!(
            "Experience Level: {}",
            match &user.experience_level {
                Some(ExperienceLevel::Fresher) => "Fresher (0-1 years)",
                Some(ExperienceLevel::Junior) => "Junior (1-3 years)",
                Some(ExperienceLevel::Mid) => "Mid-level (3-5 years)",
                None => "Not specified",
            }
        ),
        &font,
        11.0,
        &mut y_position,
    );

    // Career Track
    add_section_title("Career Track", &mut y_position);
    add_text(
        &format!(
            "Preferred Track: {}",
            match &user.preferred_track {
                Some(CareerTrack::WebDevelopment) => "Web Development",
                Some(CareerTrack::Data) => "Data Science & Analytics",
                Some(CareerTrack::Design) => "UI/UX Design",
                Some(CareerTrack::Marketing) => "Digital Marketing",
                None => "Not specified",
            }
        ),
        &font,
        11.0,
        &mut y_position,
    );

    // Skills
    if !user.skills.is_empty() {
        add_section_title("Skills", &mut y_position);
        let skills_text = user.skills.join(", ");
        // Word wrap for long skills list
        let max_chars_per_line = 80;
        for chunk in skills_text.as_bytes().chunks(max_chars_per_line) {
            if let Ok(chunk_str) = std::str::from_utf8(chunk) {
                add_text(chunk_str, &font, 11.0, &mut y_position);
            }
        }
    }

    // Projects
    if !user.projects.is_empty() {
        add_section_title("Projects", &mut y_position);
        for (i, project) in user.projects.iter().enumerate() {
            add_text(
                &format!("{}. {}", i + 1, project),
                &font,
                11.0,
                &mut y_position,
            );
        }
    }

    // Target Roles
    if !user.target_roles.is_empty() {
        add_section_title("Target Roles", &mut y_position);
        for role in &user.target_roles {
            add_text(&format!("• {}", role), &font, 11.0, &mut y_position);
        }
    }

    // Save PDF to bytes
    let pdf_bytes = doc.save_to_bytes().map_err(|e| {
        error!("Failed to generate PDF bytes: {}", e);
        AppError::InternalServerError
    })?;

    info!(
        "CV generated successfully for user: {} ({} bytes)",
        auth_user.user_id,
        pdf_bytes.len()
    );

    // Return PDF as downloadable file
    Ok((
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "application/pdf"),
            (
                header::CONTENT_DISPOSITION,
                &format!(
                    "attachment; filename=\"{}_CV.pdf\"",
                    user.full_name.replace(' ', "_")
                ),
            ),
        ],
        pdf_bytes,
    )
        .into_response())
}
