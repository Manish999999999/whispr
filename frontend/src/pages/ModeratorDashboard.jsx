import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ModeratorDashboard() {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const { user } = useAuth();

  const fetchFlagged = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:8000/api/moderation/flagged', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, [user]);

  const handleRemove = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/moderation/posts/${id}/remove`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (res.ok) {
        fetchFlagged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return (
      <div className="glass-card empty-state">
        <p>🚫 Access Denied — Moderators only.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>🛡️ Moderation Dashboard</h2>
        <span className="text-sm">{flaggedPosts.length} flagged</span>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Posts automatically flagged for review (flag count ≥ 5).
      </p>

      {flaggedPosts.length === 0 ? (
        <div className="glass-card empty-state">
          <p>✅ All clear — no posts under review.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table className="mod-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Content</th>
                <th>Flags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedPosts.map((post) => (
                <tr key={post.post_id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    #{post.post_id}
                  </td>
                  <td>
                    {post.content.length > 60
                      ? post.content.substring(0, 60) + '...'
                      : post.content}
                  </td>
                  <td>
                    <span
                      style={{
                        color: 'var(--danger)',
                        fontWeight: 700,
                        background: 'rgba(248,113,113,0.1)',
                        padding: '0.15rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                      }}
                    >
                      {post.flag_count}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
                      onClick={() => handleRemove(post.post_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
