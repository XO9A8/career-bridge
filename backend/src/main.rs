//! CareerBridge API Server
//!
//! Main entry point for the CareerBridge API server.
//! Sets up database connection, logging, and HTTP server.

use std::net::SocketAddr;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use sqlx::PgPool; 
use dotenvy::dotenv; 
use std::env;
use backend::{AppState, handlers};

/// Main application entry point.
/// 
/// Initializes the database connection, sets up tracing, and starts the HTTP server.
#[tokio::main]
async fn main() {
    dotenv().ok(); 
    
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set global tracing subscriber");
        
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
        
    let db_pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to create database connection pool");
    
    info!("Database connection pool created successfully.");
    
    let app_state = AppState { db_pool };

    let app = handlers::create_router(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    info!("Server listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap();

    axum::serve(listener, app)
        .await
        .unwrap();
}