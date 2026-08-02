-- schema.sql
-- Whispr: Anonymous Campus Confession Board
-- Complete PostgreSQL DDL Script

-- ==========================================
-- TABLES
-- ==========================================

-- 1. users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    handle VARCHAR UNIQUE,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'student' CHECK (role IN ('student','moderator','admin')),
    created_at TIMESTAMP DEFAULT now()
);

-- 2. categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);

-- 3. posts table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    category_id INT REFERENCES categories(category_id),
    content TEXT NOT NULL,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active','under_review','removed')),
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    flag_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 4. comments table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id),
    user_id INT REFERENCES users(user_id),
    content TEXT NOT NULL,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active','removed')),
    created_at TIMESTAMP DEFAULT now()
);

-- 5. votes table
CREATE TABLE votes (
    vote_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id),
    user_id INT REFERENCES users(user_id),
    vote_type VARCHAR NOT NULL CHECK (vote_type IN ('up','down')),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- 6. flags table
CREATE TABLE flags (
    flag_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id) NULL,
    comment_id INT REFERENCES comments(comment_id) NULL,
    reporter_id INT REFERENCES users(user_id),
    reason VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- 7. moderation_log table
CREATE TABLE moderation_log (
    log_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id),
    action VARCHAR NOT NULL,
    moderator_id INT REFERENCES users(user_id) NULL,
    created_at TIMESTAMP DEFAULT now()
);


-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Trigger 1: trg_update_vote_counts
-- Recalculates posts.upvotes and posts.downvotes for the affected post_id
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'up' THEN
            UPDATE posts SET upvotes = upvotes + 1 WHERE post_id = NEW.post_id;
        ELSIF NEW.vote_type = 'down' THEN
            UPDATE posts SET downvotes = downvotes + 1 WHERE post_id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'up' THEN
            UPDATE posts SET upvotes = upvotes - 1 WHERE post_id = OLD.post_id;
        ELSIF OLD.vote_type = 'down' THEN
            UPDATE posts SET downvotes = downvotes - 1 WHERE post_id = OLD.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vote_counts
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_counts();


-- Trigger 2: trg_auto_flag_review
-- Increments flag_count; if >= 5, sets status='under_review' and logs action
CREATE OR REPLACE FUNCTION auto_flag_review()
RETURNS TRIGGER AS $$
DECLARE
    current_flag_count INT;
BEGIN
    IF NEW.post_id IS NOT NULL THEN
        -- Increment flag count and return the updated value
        UPDATE posts
        SET flag_count = flag_count + 1
        WHERE post_id = NEW.post_id
        RETURNING flag_count INTO current_flag_count;

        -- Check if it crosses the threshold
        IF current_flag_count >= 5 THEN
            -- Only update if it is currently 'active'
            UPDATE posts
            SET status = 'under_review'
            WHERE post_id = NEW.post_id AND status = 'active';

            -- If the status was successfully changed, add to moderation_log
            IF FOUND THEN
                INSERT INTO moderation_log (post_id, action)
                VALUES (NEW.post_id, 'auto_flagged');
            END IF;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_flag_review
AFTER INSERT ON flags
FOR EACH ROW
EXECUTE FUNCTION auto_flag_review();


-- ==========================================
-- VIEWS
-- ==========================================

-- View 1: trending_posts_view
CREATE OR REPLACE VIEW trending_posts_view AS
SELECT 
    p.post_id, 
    p.content, 
    p.upvotes, 
    p.downvotes, 
    (p.upvotes - p.downvotes) AS score, 
    c.name AS category_name, 
    p.created_at
FROM posts p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active' 
  AND p.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY score DESC;


-- View 2: flagged_posts_view
CREATE OR REPLACE VIEW flagged_posts_view AS
SELECT 
    p.post_id, 
    p.content, 
    p.flag_count, 
    c.name AS category_name, 
    p.created_at
FROM posts p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'under_review';


-- ==========================================
-- INDEXES
-- ==========================================

-- Index on created_at for time-based filtering (e.g. trending_posts_view)
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Index on status for quick filtering of active/under_review posts
CREATE INDEX idx_posts_status ON posts(status);

-- Note: The UNIQUE(post_id, user_id) constraint on the votes table 
-- automatically creates a unique index, satisfying the indexing requirement for votes.
