import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 1, name: '📚 Academics' },
  { id: 2, name: '❤️ Relationships' },
  { id: 3, name: '🏫 Campus Life' },
  { id: 4, name: '😂 Funny' },
  { id: 5, name: '💭 Other' },
];

const MAX_CHARS = 500;

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const charsLeft = MAX_CHARS - content.length;
  const counterClass =
    charsLeft <= 0 ? 'danger' : charsLeft <= 50 ? 'warning' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to post');
    if (content.length > MAX_CHARS) return alert('Confession is too long!');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ category_id: parseInt(categoryId), content }),
      });
      if (res.ok) {
        navigate('/');
      } else {
        alert('Failed to post');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card form-card" style={{ maxWidth: '600px' }}>
      <h2>✍️ Confess Something</h2>
      <p className="subtitle">Your identity stays completely anonymous</p>

      <form onSubmit={handleSubmit}>
        {/* Category Chips */}
        <label className="text-sm" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Choose a category
        </label>
        <div className="chip-group">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip ${categoryId === cat.id ? 'active' : ''}`}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          className="input-field"
          rows="6"
          placeholder="What's on your mind? Let it all out..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className={`char-counter ${counterClass}`}>
          {charsLeft} characters remaining
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          disabled={loading || content.length === 0 || content.length > MAX_CHARS}
        >
          {loading ? 'Posting...' : '🚀 Post Confession'}
        </button>
      </form>
    </div>
  );
}
