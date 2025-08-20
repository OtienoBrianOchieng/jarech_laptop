import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    passwordConfirmation: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && userData.password !== userData.passwordConfirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login({ email: userData.email, password: userData.password });
      } else {
        await signup(userData);
      }
      // On success, your AuthContext should handle the redirect or state update
    } catch (err) {
      setError(isLogin 
        ? 'Login failed. Please check your credentials.' 
        : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Reset form but keep email for better UX
    setUserData({ 
      name: '', 
      email: userData.email, 
      password: '', 
      passwordConfirmation: '' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${isLogin ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${!isLogin ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {isLogin ? 'Sign in to continue' : 'Join us to get started'}
          </p>
          
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
                minLength="6"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="passwordConfirmation">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="passwordConfirmation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={userData.passwordConfirmation}
                  onChange={(e) => setUserData({ ...userData, passwordConfirmation: e.target.value })}
                  required={!isLogin}
                  minLength="6"
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={toggleMode}
              className="text-blue-500 font-medium hover:text-blue-700 mt-2 focus:outline-none focus:underline"
            >
              {isLogin ? 'Sign up now' : 'Login instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;