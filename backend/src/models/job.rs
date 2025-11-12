use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Job {
    pub id: Uuid,
    pub title: String,
    pub company: String,
    pub location: String,
    pub job_type: String, // full-time, part-time, contract, internship
    pub salary_range: Option<String>,
    pub description: String,
    pub requirements: Vec<String>,
    pub responsibilities: Vec<String>,
    pub perks: Option<Vec<String>>,
    pub experience_level: String, // entry, junior, mid, senior
    pub is_active: bool,
    pub posted_date: DateTime<Utc>,
    pub application_deadline: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct JobSkill {
    pub id: Uuid,
    pub job_id: Uuid,
    pub skill_id: Uuid,
    pub is_required: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct JobWithSkills {
    pub id: Uuid,
    pub title: String,
    pub company: String,
    pub location: String,
    pub job_type: String,
    pub salary_range: Option<String>,
    pub description: String,
    pub requirements: Vec<String>,
    pub responsibilities: Vec<String>,
    pub perks: Option<Vec<String>>,
    pub experience_level: String,
    pub posted_date: DateTime<Utc>,
    pub skills: Option<Vec<String>>,
    pub match_percentage: Option<f32>,
}

#[derive(Debug, Deserialize)]
pub struct JobFilterParams {
    pub search: Option<String>,
    pub location: Option<String>,
    pub job_type: Option<String>,
    pub experience_level: Option<String>,
    pub skills: Option<Vec<Uuid>>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobRequest {
    pub title: String,
    pub company: String,
    pub location: String,
    pub job_type: String,
    pub salary_range: Option<String>,
    pub description: String,
    pub requirements: Vec<String>,
    pub responsibilities: Vec<String>,
    pub perks: Option<Vec<String>>,
    pub experience_level: String,
    pub skill_ids: Vec<Uuid>,
}
