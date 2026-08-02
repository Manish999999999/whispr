import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = isLogin
      ? 'http://localhost:8000/api/auth/login'
      : 'http://localhost:8000/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, handle };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (isLogin) {
          login(data.access_token, data.role, data.handle);
          navigate('/');
        } else {
          setIsLogin(true);
          alert('Signup successful! Please login.');
        }
      } else {
        alert(data.detail || 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card form-card">
      <h2>{isLogin ? 'Welcome back' : 'Join Whispr'}</h2>
      <p className="subtitle">
        {isLogin
          ? 'Sign in to share and explore confessions'
          : 'Create your anonymous identity'}
      </p>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Choose an anonymous handle"
            className="input-field"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="off"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
          <button
            type="button"
            className="toggle-pw"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* 🔥 The only change: The button text is now always "Login" */}
        <button
          type="submit"
          className="btn"
          style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
          disabled={loading}
        >
          {loading ? '...' : 'Login'}
        </button>
      </form>

      <p className="toggle-link">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <span onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign up' : 'Sign in'}
        </span>
      </p>
    </div>
  );
}