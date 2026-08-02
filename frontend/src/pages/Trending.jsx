import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Trending() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/trending');
        const data = await res.json();
        setTrending(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>🔥 Trending Confessions</h2>
        <span className="text-sm">Last 24 hours</span>
      </div>

      {trending.length === 0 && (
        <div className="empty-state glass-card">
          <p>No trending confessions right now. Check back later! 🔥</p>
        </div>
      )}

      {trending.map((post, index) => (
        <div key={post.post_id} className="card">
          <div className="flex-between">
            <div className="post-meta">
              {post.category_name && <span className="badge">{post.category_name}</span>}
            </div>
            <div className="flex-gap">
              <span className="score-badge">
                🏆 Score: {post.score}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  background: 'rgba(148,163,184,0.08)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                #{index + 1}
              </span>
            </div>
          </div>

          <p className="post-content">{post.content}</p>

          <div className="post-actions">
            <div className="left">
              <span className="vote-btn" style={{ cursor: 'default' }}>▲ {post.upvotes || 0}</span>
              <span className="vote-btn" style={{ cursor: 'default' }}>▼ {post.downvotes || 0}</span>
            </div>
            <Link to={`/post/${post.post_id}`} className="btn-ghost btn" style={{ background: 'transparent' }}>
              💬 View Discussion
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
