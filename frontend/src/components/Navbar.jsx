import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (handle) => {
    if (!handle) return '?';
    return handle.charAt(0).toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🤫 Whispr
      </Link>
      <div className="nav-links">
        <Link
          to="/"
          className="nav-link"
          style={isActive('/') ? { color: 'var(--accent-1)' } : {}}
        >
          Home
        </Link>
        <Link
          to="/trending"
          className="nav-link"
          style={isActive('/trending') ? { color: 'var(--accent-1)' } : {}}
        >
          🔥 Trending
        </Link>
        {user ? (
          <>
            <Link to="/create" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
              ✍️ Confess
            </Link>
            {(user.role === 'moderator' || user.role === 'admin') && (
              <Link
                to="/mod"
                className="nav-link"
                style={isActive('/mod') ? { color: 'var(--accent-1)' } : {}}
              >
                🛡️ Mod
              </Link>
            )}
            <button onClick={logout} className="btn-ghost btn" style={{ background: 'transparent', border: '1px solid var(--border-color)' }}>
              Logout
            </button>
            <div className="avatar" title={user.handle || 'User'}>
              {getInitials(user.handle)}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
