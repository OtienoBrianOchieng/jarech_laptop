import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-green-700 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white text-xl font-bold hover:text-orange-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Fish Market Admin</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/orders" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive('/orders') 
                      ? 'bg-white text-orange-700 shadow-lg' 
                      : 'text-orange-100 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Orders</span>
                  </div>
                </Link>

<Link 
  to="/riders" 
  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
    isActive('/riders') 
      ? 'bg-white text-orange-700 shadow-lg' 
      : 'text-orange-100 hover:bg-orange-500 hover:text-white'
  }`}
>
  <div className="flex items-center space-x-1">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
    <span>Riders</span>
  </div>
</Link>
                
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/products" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive('/products') 
                          ? 'bg-white text-orange-700 shadow-lg' 
                          : 'text-orange-100 hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Products</span>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/reviews" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive('/reviews') 
                          ? 'bg-white text-orange-700 shadow-lg' 
                          : 'text-orange-100 hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>Reviews</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Info and Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-orange-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-orange-100 text-sm font-medium">
                  {user.name} <span className="text-orange-200">({user.role})</span>
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:shadow-lg border border-white/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu indicator */}
      {user && (
        <div className="md:hidden bg-orange-700 border-t border-orange-500">
          <div className="px-4 py-2 flex justify-around">
            <Link 
              to="/orders" 
              className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive('/orders') 
                  ? 'bg-white text-orange-700' 
                  : 'text-orange-100 hover:bg-orange-500'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Orders</span>
            </Link>
            
            {user.role === 'admin' && (
              <>
                <Link 
                  to="/products" 
                  className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive('/products') 
                      ? 'bg-white text-orange-700' 
                      : 'text-orange-100 hover:bg-orange-500'
                  }`}
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Products</span>
                </Link>
                
                <Link 
                  to="/reviews" 
                  className={`flex flex-col items-center px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive('/reviews') 
                      ? 'bg-white text-orange-700' 
                      : 'text-orange-100 hover:bg-orange-500'
                  }`}
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Reviews</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;