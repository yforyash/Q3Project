import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import api, { setAccessToken } from './utils/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post('/auth/refresh-token');
        setUser(res.data.user);
        setAccessToken(res.data.token);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loginUser = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    setIsAuthenticated(true);
    navigate('/');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAccessToken('');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020617] text-slate-200">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-sm font-medium tracking-wide">Loading Q3 Enterprise System...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, logout, loading }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthContext.Provider>
  );
}
