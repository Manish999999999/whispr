import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPostAndComments = async () => {
    try {
      const pRes = await fetch(`http://localhost:8000/api/posts/${id}`);
      const pData = await pRes.json();
      setPost(pData);

      const cRes = await fetch(`http://localhost:8000/api/posts/${id}/comments`);
      const cData = await cRes.json();
      setComments(cData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Login to comment');
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      fetchPostAndComments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!post) {
    return (
      <div className="empty-state glass-card">
        <p>Loading confession...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link to="/" className="text-sm" style={{ display: 'inline-block', marginBottom: '1rem' }}>
        ← Back to Feed
      </Link>

      {/* Post */}
      <div className="glass-card">
        <div className="post-meta">
          <span>🕐 {timeAgo(post.created_at)}</span>
          {post.category_name && <span className="badge">{post.category_name}</span>}
        </div>
        <p className="post-content" style={{ fontSize: '1.15rem' }}>
          {post.content}
        </p>
        <div className="flex-gap text-sm" style={{ marginTop: '0.5rem' }}>
          <span>▲ {post.upvotes || 0}</span>
          <span>▼ {post.downvotes || 0}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>
          💬 Comments ({comments.length})
        </h3>

        <div className="comments-section">
          {comments.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
              No comments yet. Start the conversation!
            </p>
          )}
          {comments.map((c) => (
            <div key={c.comment_id} className="comment-item">
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {c.content}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {timeAgo(c.created_at)}
              </p>
            </div>
          ))}
        </div>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleComment} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Write a thoughtful comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
            <Link to="/login">Sign in</Link> to join the conversation.
          </p>
        )}
      </div>
    </div>
  );
}
