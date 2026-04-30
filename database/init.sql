-- PostgreSQL Database Schema for Sentient Retention Engine

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    usage_score FLOAT DEFAULT 0,
    complaints_count INT DEFAULT 0,
    payment_delay_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent memory table (stores past decisions)
CREATE TABLE IF NOT EXISTS agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    result VARCHAR(50),
    churn_risk FLOAT NOT NULL,
    expected_churn FLOAT,
    reason TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Churn predictions log
CREATE TABLE IF NOT EXISTS churn_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    usage_score FLOAT NOT NULL,
    complaints_count INT NOT NULL,
    payment_delay_count INT NOT NULL,
    churn_risk FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Retention actions log
CREATE TABLE IF NOT EXISTS retention_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_memory_user_id ON agent_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_user_id ON churn_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_date ON churn_predictions(predicted_at);
CREATE INDEX IF NOT EXISTS idx_retention_actions_user_id ON retention_actions(user_id);

-- Sample data
INSERT INTO users (user_id, email, name, usage_score, complaints_count, payment_delay_count) VALUES
    ('user_001', 'john.doe@example.com', 'John Doe', 15, 3, 2),
    ('user_002', 'jane.smith@example.com', 'Jane Smith', 45, 0, 0),
    ('user_003', 'bob.wilson@example.com', 'Bob Wilson', 8, 5, 4),
    ('user_004', 'alice.brown@example.com', 'Alice Brown', 30, 1, 1),
    ('user_005', 'charlie.davis@example.com', 'Charlie Davis', 60, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- View for agent memory summary
CREATE OR REPLACE VIEW agent_memory_summary AS
SELECT 
    user_id,
    COUNT(*) as total_decisions,
    COUNT(CASE WHEN action = 'DISCOUNT' THEN 1 END) as discount_actions,
    COUNT(CASE WHEN action = 'EMAIL' THEN 1 END) as email_actions,
    COUNT(CASE WHEN action = 'NONE' THEN 1 END) as no_actions,
    AVG(churn_risk) as avg_churn_risk,
    MIN(executed_at) as first_decision,
    MAX(executed_at) as last_decision
FROM agent_memory
GROUP BY user_id;

-- Raw Customer Churn Data Table (matching Telco-Customer-Churn.csv)
CREATE TABLE IF NOT EXISTS raw_customer_churn (
    customer_id VARCHAR(50) PRIMARY KEY,
    gender VARCHAR(10),
    senior_citizen INT,
    partner VARCHAR(5),
    dependents VARCHAR(5),
    tenure INT,
    phone_service VARCHAR(5),
    multiple_lines VARCHAR(25),
    internet_service VARCHAR(25),
    online_security VARCHAR(25),
    online_backup VARCHAR(25),
    device_protection VARCHAR(25),
    tech_support VARCHAR(25),
    streaming_tv VARCHAR(25),
    streaming_movies VARCHAR(25),
    contract VARCHAR(25),
    paperless_billing VARCHAR(5),
    payment_method VARCHAR(50),
    monthly_charges FLOAT,
    total_charges VARCHAR(25), -- Some values are empty strings in CSV
    churn VARCHAR(5)
);