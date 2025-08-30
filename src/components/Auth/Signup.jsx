import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthForm = () => {
  const [authMode, setAuthMode] = useState('adminLogin'); // 'adminLogin', 'adminSignup', 'riderLogin'
  const [userData, setUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    passwordConfirmation: '',
    phonenumber: '',
    accessCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, riderLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (authMode === 'adminSignup' && userData.password !== userData.passwordConfirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (authMode === 'riderLogin' && (!userData.phonenumber || !userData.accessCode)) {
      setError('Phone number and access code are required');
      setLoading(false);
      return;
    }

    try {
      switch (authMode) {
        case 'adminLogin':
          await login({ email: userData.email, password: userData.password });
          break;
        case 'adminSignup':
          await signup(userData);
          break;
        case 'riderLogin':
          await riderLogin({ 
            phonenumber: userData.phonenumber, 
            accessCode: userData.accessCode 
          });
          break;
        default:
          throw new Error('Invalid auth mode');
      }
    } catch (err) {
      setError(getErrorMessage(authMode, err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (mode, error) => {
    const messages = {
      adminLogin: 'Login failed. Please check your credentials.',
      adminSignup: 'Registration failed. Please try again.',
      riderLogin: 'Invalid phone number or access code. Please try again.'
    };
    return error.message || messages[mode] || 'An error occurred';
  };

  const setAuthModeWithReset = (mode) => {
    setAuthMode(mode);
    setError('');
    setUserData({ 
      name: '', 
      email: userData.email, 
      password: '', 
      passwordConfirmation: '',
      phonenumber: '',
      accessCode: ''
    });
  };

  const isAdminMode = authMode === 'adminLogin' || authMode === 'adminSignup';
  const isLoginMode = authMode === 'adminLogin' || authMode === 'riderLogin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        {/* Logo/Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-orange-500 to-green-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Fish Market Platform</h1>
          <p className="text-sm md:text-base text-gray-600">
            {authMode === 'riderLogin' ? 'Rider Login Portal' : 'Manage your seafood business with ease'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex bg-gray-50/50">
            <button
              className={`flex-1 py-4 md:py-5 px-4 md:px-6 text-center font-semibold transition-all duration-300 ${
                authMode === 'adminLogin' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthModeWithReset('adminLogin')}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm md:text-base">Admin Login</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 md:py-5 px-4 md:px-6 text-center font-semibold transition-all duration-300 ${
                authMode === 'adminSignup' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthModeWithReset('adminSignup')}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm md:text-base">Admin Sign Up</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 md:py-5 px-4 md:px-6 text-center font-semibold transition-all duration-300 ${
                authMode === 'riderLogin' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setAuthModeWithReset('riderLogin')}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm md:text-base">Rider Login</span>
              </div>
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-3">
              {authMode === 'adminLogin' ? 'Welcome back!' : 
               authMode === 'adminSignup' ? 'Create admin account' : 
               'Rider Login'}
            </h2>
            <p className="text-center text-gray-600 text-sm md:text-base mb-6 md:mb-8">
              {authMode === 'adminLogin' ? 'Sign in to your admin dashboard' : 
               authMode === 'adminSignup' ? 'Join us to manage your business' : 
               'Sign in with your phone number and access code'}
            </p>
            
            {error && (
              <div className="mb-4 md:mb-6 bg-red-50 border border-red-200 text-red-700 p-3 md:p-4 rounded-xl flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm md:text-base">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Admin Signup Fields */}
              {authMode === 'adminSignup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                      placeholder="Enter your full name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      required
                    />
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Email Field (Admin only) */}
              {isAdminMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                      placeholder="Enter your email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      required={isAdminMode}
                    />
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Phone Number Field (Rider only) */}
              {authMode === 'riderLogin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="phonenumber">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phonenumber"
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                      placeholder="Enter your phone number"
                      value={userData.phonenumber}
                      onChange={(e) => setUserData({ ...userData, phonenumber: e.target.value })}
                      required
                    />
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Access Code Field (Rider only) */}
              {authMode === 'riderLogin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="accessCode">
                    Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="accessCode"
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                      placeholder="Enter your access code"
                      value={userData.accessCode}
                      onChange={(e) => setUserData({ ...userData, accessCode: e.target.value })}
                      required
                    />
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Password Fields (Admin only) */}
              {isAdminMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                        placeholder="Enter your password"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        required={isAdminMode}
                        minLength="6"
                      />
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  
                  {authMode === 'adminSignup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3" htmlFor="passwordConfirmation">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="passwordConfirmation"
                          className="w-full px-4 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm md:text-base"
                          placeholder="Confirm your password"
                          value={userData.passwordConfirmation}
                          onChange={(e) => setUserData({ ...userData, passwordConfirmation: e.target.value })}
                          required
                          minLength="6"
                        />
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-gradient-to-r text-white py-3 md:py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-sm md:text-base ${
                  authMode === 'riderLogin' 
                    ? 'from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500' 
                    : 'from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 focus:ring-orange-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {authMode === 'adminLogin' ? 'Signing in...' : 
                     authMode === 'adminSignup' ? 'Creating account...' : 
                     'Logging in...'}
                  </span>
                ) : (
                  authMode === 'adminLogin' ? 'Sign In' : 
                  authMode === 'adminSignup' ? 'Create Account' : 
                  'Login as Rider'
                )}
              </button>
            </form>
            
            <div className="mt-6 md:mt-8 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {authMode === 'adminLogin' ? "Don't have an account?" : 
                 authMode === 'adminSignup' ? "Already have an account?" : 
                 "Are you an admin?"}
              </p>
              <button 
                onClick={() => setAuthModeWithReset(
                  authMode === 'adminLogin' ? 'adminSignup' : 
                  authMode === 'adminSignup' ? 'adminLogin' : 
                  'adminLogin'
                )}
                className="text-orange-500 font-semibold hover:text-orange-700 mt-2 transition-colors duration-200 focus:outline-none focus:underline text-sm md:text-base"
              >
                {authMode === 'adminLogin' ? 'Create one now →' : 
                 authMode === 'adminSignup' ? 'Sign in here →' : 
                 'Go to Admin Login →'}
              </button>
            </div>

            {/* Rider specific link */}
            {authMode !== 'riderLogin' && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setAuthModeWithReset('riderLogin')}
                  className="text-blue-500 font-semibold hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:underline text-sm md:text-base"
                >
                  Are you a rider? Login here →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 md:mt-8">
          <p className="text-gray-500 text-xs md:text-sm">
            © 2024 Fish Market Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;