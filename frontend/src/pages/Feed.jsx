import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleVote = async (id, type) => {
    if (!user) return alert('Login to vote');
    try {
      await fetch(`http://localhost:8000/api/posts/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ vote_type: type }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1>Share Your Truth, Anonymously</h1>
        <p>A safe space for confessions, stories, and thoughts that need to be heard.</p>
        {user ? (
          <Link to="/create" className="btn btn-primary" style={{ padding: '0.7rem 2rem', fontSize: '1rem' }}>
            ✍️ Write a Confession
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.7rem 2rem', fontSize: '1rem' }}>
            Get Started
          </Link>
        )}
      </div>

      {/* Feed Header */}
      <div className="page-header">
        <h2>Latest Confessions</h2>
        <span className="text-sm">{posts.length} posts</span>
      </div>

      {/* Post Cards */}
      {posts.length === 0 && (
        <div className="empty-state glass-card">
          <p>No confessions yet. Be the first to share! 🤫</p>
        </div>
      )}

      {posts.map((post) => (
        <div key={post.post_id} className="card">
          <div className="post-meta">
            <span>🕐 {timeAgo(post.created_at)}</span>
            {post.category_name && <span className="badge">{post.category_name}</span>}
          </div>

          <p className="post-content">{post.content}</p>

          <div className="post-actions">
            <div className="left">
              <button
                className="vote-btn upvote"
                onClick={() => handleVote(post.post_id, 'up')}
              >
                ▲ {post.upvotes || 0}
              </button>
              <button
                className="vote-btn downvote"
                onClick={() => handleVote(post.post_id, 'down')}
              >
                ▼ {post.downvotes || 0}
              </button>
            </div>
            <Link to={`/post/${post.post_id}`} className="btn-ghost btn" style={{ background: 'transparent' }}>
              💬 Comments
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
