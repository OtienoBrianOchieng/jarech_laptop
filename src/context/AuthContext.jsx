import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser, riderLogin } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setToken(storedToken);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { user, token } = await loginUser(credentials);
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const signup = async (userData) => {
    const { user, token } = await registerUser(userData);
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
  };

  const riderLoginHandler = async (credentials) => {
    const { user, token } = await riderLogin(credentials);
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user); // Assuming the API returns 'rider' instead of 'user'
    return user;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading, 
      login, 
      signup, 
      logout,
      riderLogin: riderLoginHandler 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);