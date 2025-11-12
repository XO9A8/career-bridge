use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct LearningResource {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub resource_type: String, // course, tutorial, article, video, book
    pub provider: String,
    pub url: String,
    pub difficulty_level: String, // beginner, intermediate, advanced
    pub duration_hours: Option<i32>,
    pub cost: String, // free, paid
    pub price: Option<String>,
    pub rating: Option<f32>,
    pub thumbnail_url: Option<String>,
    pub skill_id: Option<Uuid>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LearningResourceWithSkill {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub resource_type: String,
    pub provider: String,
    pub url: String,
    pub difficulty_level: String,
    pub duration_hours: Option<i32>,
    pub cost: String,
    pub price: Option<String>,
    pub rating: Option<f32>,
    pub thumbnail_url: Option<String>,
    pub skill_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ResourceFilterParams {
    pub search: Option<String>,
    pub skill_id: Option<Uuid>,
    pub resource_type: Option<String>,
    pub difficulty_level: Option<String>,
    pub cost: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateResourceRequest {
    pub title: String,
    pub description: String,
    pub resource_type: String,
    pub provider: String,
    pub url: String,
    pub difficulty_level: String,
    pub duration_hours: Option<i32>,
    pub cost: String,
    pub price: Option<String>,
    pub rating: Option<f32>,
    pub thumbnail_url: Option<String>,
    pub skill_id: Option<Uuid>,
}
