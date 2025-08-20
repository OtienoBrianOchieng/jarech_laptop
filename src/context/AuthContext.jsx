import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const { user, token } = await loginUser(credentials);
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const signup = async (userData) => {
    const role = userData.email === 'brianochieng1@gmail.com' ? 'admin' : 'seller';
    const { user, token } = await registerUser({ ...userData, role });
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);