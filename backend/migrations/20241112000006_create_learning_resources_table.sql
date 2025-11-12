-- Create learning_resources table
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('course', 'tutorial', 'article', 'video', 'book', 'documentation')),
    provider VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_hours INTEGER,
    cost VARCHAR(20) NOT NULL CHECK (cost IN ('free', 'paid')),
    price VARCHAR(50),
    rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
    thumbnail_url VARCHAR(1000),
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for filtering and searching
CREATE INDEX IF NOT EXISTS idx_learning_resources_resource_type ON learning_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_learning_resources_difficulty ON learning_resources(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_learning_resources_cost ON learning_resources(cost);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_id ON learning_resources(skill_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_rating ON learning_resources(rating DESC);
CREATE INDEX IF NOT EXISTS idx_learning_resources_is_active ON learning_resources(is_active);
