//! Google Gemini API client for AI operations.

use crate::errors::AppError;
use reqwest::Client;
use serde::{Deserialize, Serialize};

/// Gemini API client
pub struct GeminiClient {
    api_key: String,
    client: Client,
    base_url: String,
}

#[derive(Debug, Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    #[serde(skip_serializing_if = "Option::is_none")]
    generation_config: Option<GenerationConfig>,
}

#[derive(Debug, Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Debug, Serialize)]
struct Part {
    text: String,
}

#[derive(Debug, Serialize)]
struct GenerationConfig {
    temperature: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    response_mime_type: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Debug, Deserialize)]
struct Candidate {
    content: ContentResponse,
}

#[derive(Debug, Deserialize)]
struct ContentResponse {
    parts: Vec<PartResponse>,
}

#[derive(Debug, Deserialize)]
struct PartResponse {
    text: String,
}

impl GeminiClient {
    /// Create a new Gemini client
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
            base_url: "https://generativelanguage.googleapis.com/v1beta".to_string(),
        }
    }

    /// Generate content using Gemini
    ///
    /// # Arguments
    /// * `prompt` - The prompt to send to Gemini
    /// * `model` - The model to use (default: "gemini-2.0-flash")
    /// * `temperature` - Temperature for generation (default: 0.7)
    /// * `json_mode` - Whether to request JSON response
    pub async fn generate(
        &self,
        prompt: &str,
        model: Option<&str>,
        temperature: Option<f32>,
        json_mode: bool,
    ) -> Result<String, AppError> {
        let model = model.unwrap_or("gemini-2.0-flash");
        let temperature = temperature.unwrap_or(0.7);

        let generation_config = if json_mode {
            Some(GenerationConfig {
                temperature,
                response_mime_type: Some("application/json".to_string()),
            })
        } else {
            Some(GenerationConfig {
                temperature,
                response_mime_type: None,
            })
        };

        let request = GeminiRequest {
            contents: vec![Content {
                parts: vec![Part {
                    text: prompt.to_string(),
                }],
            }],
            generation_config,
        };

        let url = format!(
            "{}/models/{}:generateContent?key={}",
            self.base_url, model, self.api_key
        );

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Gemini API request failed: {}", e);
                AppError::ExternalServiceError(format!("Gemini API error: {}", e))
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("Gemini API error {}: {}", status, error_text);
            return Err(AppError::ExternalServiceError(format!(
                "Gemini API returned {}: {}",
                status, error_text
            )));
        }

        let gemini_response: GeminiResponse = response.json().await.map_err(|e| {
            tracing::error!("Failed to parse Gemini response: {}", e);
            AppError::ExternalServiceError(format!("Failed to parse Gemini response: {}", e))
        })?;

        gemini_response
            .candidates
            .first()
            .and_then(|c| c.content.parts.first())
            .map(|p| p.text.clone())
            .ok_or_else(|| AppError::ExternalServiceError("No response from Gemini".to_string()))
    }

    /// Extract skills from CV text
    pub async fn extract_skills(&self, cv_text: &str) -> Result<String, AppError> {
        let prompt = format!(
            r#"You are an expert CV/resume analyzer. Analyze the following CV/resume text and extract structured information.

CV Text:
{}

Please extract and return a JSON object with the following structure:
{{
  "technical_skills": [
    {{"name": "Python", "proficiency": "advanced", "category": "programming_language"}},
    {{"name": "React", "proficiency": "intermediate", "category": "framework"}}
  ],
  "soft_skills": ["communication", "leadership", "problem-solving"],
  "roles": ["Software Engineer", "Full Stack Developer"],
  "domains": ["Web Development", "E-commerce"],
  "certifications": ["AWS Certified Solutions Architect"],
  "tools": ["Git", "Docker", "Jenkins"],
  "years_of_experience": 3.5,
  "education": ["B.S. Computer Science"]
}}

Guidelines:
- Extract ONLY what is explicitly mentioned or strongly implied in the CV
- For technical_skills, include programming languages, frameworks, libraries
- Categories: programming_language, framework, library, database, cloud, devops, design_tool
- Proficiency levels: beginner, intermediate, advanced, expert (infer from context)
- Be comprehensive but accurate
- Return valid JSON only, no additional text"#,
            cv_text
        );

        self.generate(&prompt, None, Some(0.3), true).await
    }

    /// Generate a comprehensive learning roadmap for a tech stack
    ///
    /// # Arguments
    /// * `tech_stack` - Target role or technology stack
    /// * `current_skills` - User's current skills
    /// * `timeframe_months` - Target timeframe in months
    /// * `learning_hours_per_week` - Available learning hours per week
    pub async fn generate_roadmap(
        &self,
        tech_stack: &str,
        current_skills: Option<&str>,
        timeframe_months: Option<u32>,
        learning_hours_per_week: Option<u32>,
    ) -> Result<String, AppError> {
        let current_skills_text = current_skills
            .map(|s| format!("\n\nCurrent skills: {}", s))
            .unwrap_or_else(|| "\n\nCurrent skills: Beginner level".to_string());

        let timeframe = timeframe_months.unwrap_or(6);
        let hours_per_week = learning_hours_per_week.unwrap_or(10);
        let total_learning_hours = timeframe * 4 * hours_per_week; // approximate weeks * hours

        let prompt = format!(
            r#"You are an expert career advisor and learning path designer. Create a comprehensive, personalized learning roadmap for: {}{}

Target Timeframe: {} months
Available Learning Time: {} hours per week (approximately {} total hours)

Return a JSON object with this EXACT structure:
{{
  "stack_name": "Full Stack Development",
  "prerequisites": ["Basic programming knowledge", "HTML/CSS basics", "Git version control"],
  "estimated_duration": "6 months",
  "difficulty": "intermediate",
  "phases": [
    {{
      "phase": 1,
      "title": "Fundamentals",
      "timeline": "Month 1 (Weeks 1-4)",
      "topics": ["JavaScript ES6+ fundamentals", "Asynchronous programming", "DOM manipulation"],
      "technologies": ["JavaScript", "HTML5", "CSS3", "Git"],
      "duration": "4 weeks",
      "learning_goals": ["Master ES6 syntax", "Build interactive web pages", "Understand async/await"],
      "resources": ["MDN Web Docs - JavaScript Guide", "JavaScript.info", "FreeCodeCamp JavaScript Course"]
    }},
    {{
      "phase": 2,
      "title": "Frontend Development",
      "timeline": "Month 2 (Weeks 5-8)",
      "topics": ["React fundamentals", "Component architecture", "State management"],
      "technologies": ["React", "React Router", "Redux/Context API"],
      "duration": "4 weeks",
      "learning_goals": ["Build component-based applications", "Manage application state", "Implement routing"],
      "resources": ["React Official Documentation", "React Tutorial - Scrimba", "React for Beginners - Wes Bos"]
    }}
  ],
  "project_suggestions": [
    {{
      "title": "Personal Portfolio Website",
      "description": "Build a responsive portfolio showcasing your projects with modern design",
      "technologies": ["HTML", "CSS", "JavaScript", "Responsive Design"],
      "difficulty": "beginner",
      "estimated_hours": 20,
      "recommended_phase": 1
    }},
    {{
      "title": "Task Management App",
      "description": "Full-featured todo app with categories, due dates, and local storage",
      "technologies": ["React", "Local Storage API", "CSS Modules"],
      "difficulty": "intermediate",
      "estimated_hours": 30,
      "recommended_phase": 2
    }}
  ],
  "job_application_timing": "After completing Phase 4 (Month 4-5), start applying for internships and junior positions. By Phase 5, you should have portfolio projects ready for full job applications."
}}

CRITICAL Guidelines:
1. Create 4-6 phases that fit within the {} month timeframe
2. Distribute learning hours realistically across phases based on {} hours/week availability
3. Each phase should build on previous phases
4. Include specific technologies and tools for each phase
5. Suggest 3-5 practical project ideas at different difficulty levels
6. Include clear learning goals for each phase
7. Recommend high-quality FREE and paid resources (prioritize free options)
8. Consider user's current skills - if they already know basics, start at intermediate level
9. Specify WHEN to start applying for jobs/internships based on skill readiness
10. Make timeline references clear (Week X-Y or Month Z)
11. Ensure project suggestions align with learned technologies
12. Return ONLY valid JSON, no markdown formatting or additional text

IMPORTANT: Tailor the roadmap difficulty and pace based on:
- User's current skill level (beginner needs more fundamentals)
- Available time (more hours/week = faster progression possible)
- Target timeframe (shorter timeframe = focus on essentials)"#,
            tech_stack, current_skills_text, timeframe, hours_per_week, total_learning_hours, timeframe, hours_per_week
        );

        self.generate(&prompt, None, Some(0.7), true).await
    }

    /// Answer a career-related question
    pub async fn answer_question(
        &self,
        question: &str,
        context: Option<&str>,
    ) -> Result<String, AppError> {
        let context_text = context
            .map(|c| format!("\n\nContext: {}", c))
            .unwrap_or_default();

        let prompt = format!(
            r#"You are CareerBot, an AI career advisor specializing in youth employment and career development, aligned with UN Sustainable Development Goal 8 (Decent Work and Economic Growth).

Your mission:
- Support young professionals in finding meaningful, quality employment opportunities
- Promote skill development that leads to decent work and economic growth
- Provide actionable career guidance focused on sustainable employment
- Empower youth to achieve their career potential

IMPORTANT GUIDELINES:
1. Always frame advice as SUGGESTIONS and GUIDANCE, never as guarantees
2. Focus on youth employment opportunities, internships, entry-level roles, and career growth
3. Emphasize skill development, continuous learning, and building a strong foundation
4. Include disclaimers when appropriate (e.g., "This is a suggestion based on current trends...")
5. Be realistic about job market conditions while remaining encouraging
6. Promote decent work conditions, fair opportunities, and sustainable career paths
7. MATCH YOUR RESPONSE LENGTH TO THE QUESTION: Simple greetings get short replies, complex questions get detailed answers
8. For greetings or casual questions: Keep response under 2-3 sentences
9. For career questions: Provide concise, focused answers (3-5 sentences unless complexity requires more)

Question: {}{}

Provide a helpful, accurate, and actionable answer. Include:
- Direct answer to the question with focus on youth employment and career growth
- Practical advice or steps aligned with SDG 8 principles
- Related topics the user might find helpful
- Clear indication that this is guidance/suggestion, not a guarantee

Return a JSON object:
{{
  "question": "the question",
  "answer": "your answer here - keep it concise and match the question's complexity (2-3 sentences for simple questions, more for complex career queries. Include inline disclaimer if making predictions/suggestions)",
  "related_topics": ["topic1", "topic2"] (only for career questions, empty array for greetings),
   (only include for career advice questions, null for simple greetings)
}}

Return valid JSON only."#,
            question, context_text
        );

        self.generate(&prompt, None, Some(0.8), true).await
    }

    /// Generate career-related content
    pub async fn generate_content(
        &self,
        content_type: &str,
        input: &str,
        parameters: Option<serde_json::Value>,
    ) -> Result<String, AppError> {
        let params_text = parameters
            .as_ref()
            .and_then(|p| serde_json::to_string_pretty(p).ok())
            .unwrap_or_default();

        let prompt = format!(
            r#"You are an expert career content writer. Generate {} based on the following:

Input:
{}

Parameters:
{}

Return a JSON object:
{{
  "content_type": "{}",
  "content": "the generated content here",
  "metadata": {{"word_count": 150, "tone": "professional"}}
}}

Guidelines:
- Make it professional and tailored
- Be specific and actionable
- Use appropriate formatting
- Return valid JSON only"#,
            content_type, input, params_text, content_type
        );

        self.generate(&prompt, None, Some(0.8), true).await
    }
}
