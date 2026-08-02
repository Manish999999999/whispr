-- sample_queries.sql
-- Useful queries for the DBMS coursework report.

-- 1. Show all active posts with their category and author handle
SELECT p.post_id, c.name AS category, u.handle AS author, p.content, p.upvotes, p.downvotes, p.created_at
FROM posts p
JOIN categories c ON p.category_id = c.category_id
JOIN users u ON p.user_id = u.user_id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;

-- 2. Show trending posts (using the view)
SELECT * FROM trending_posts_view;

-- 3. Show flagged posts pending review (using the view)
SELECT * FROM flagged_posts_view;

-- 4. Count posts per category
SELECT c.name AS category, COUNT(p.post_id) AS total_posts
FROM categories c
LEFT JOIN posts p ON c.category_id = p.category_id
GROUP BY c.category_id, c.name
ORDER BY total_posts DESC;

-- 5. Count votes per post
SELECT p.post_id, p.content, 
       SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END) AS calculated_upvotes,
       SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END) AS calculated_downvotes
FROM posts p
LEFT JOIN votes v ON p.post_id = v.post_id
GROUP BY p.post_id, p.content
ORDER BY p.post_id;

-- 6. Show a specific user's post history
SELECT post_id, content, status, created_at
FROM posts
WHERE user_id = (SELECT user_id FROM users WHERE handle = 'student1')
ORDER BY created_at DESC;

-- 7. Show comment count per post
SELECT p.post_id, p.content, COUNT(c.comment_id) AS comment_count
FROM posts p
LEFT JOIN comments c ON p.post_id = c.post_id
GROUP BY p.post_id, p.content
ORDER BY comment_count DESC;

-- 8. Calculate total flags per moderator action (from log)
SELECT action, COUNT(*) AS action_count
FROM moderation_log
GROUP BY action;
