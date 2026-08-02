import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const handle = localStorage.getItem('handle');
    if (token && role) {
      setUser({ token, role, handle });
    }
  }, []);

  const login = (token, role, handle) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('handle', handle);
    setUser({ token, role, handle });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('handle');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
