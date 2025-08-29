import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Order Management</h2>
          <p>View and update fish orders and delivery status.</p>
          <div className="mt-4">
            <Link 
              to="/orders" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Orders →
            </Link>
          </div>
        </div>
        
        {user?.role === 'admin' && (
          <>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Product Management</h2>
            <p>Manage fish products and options.</p>
            <div className="mt-4">
              <Link 
                to="/products" 
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Go to Products →
              </Link>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Reviews</h2>
            <p>Read Customer Reviews.</p>
            <div className="mt-4">
              <Link 
                to="/reviews" 
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Go to Reviews →
              </Link>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;