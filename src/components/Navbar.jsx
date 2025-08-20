import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="text-lg font-semibold text-gray-800">
            Fish Market Admin
          </Link>
          {user && (
            <>
              <Link to="/orders" className="px-3 py-2 text-gray-600 hover:text-gray-900">
                Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/products" className="px-3 py-2 text-gray-600 hover:text-gray-900">
                  Products
                </Link>
              )}
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;