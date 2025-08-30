import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, today: 0, difference: 0 },
    products: { total: 0 },
    reviews: { total: 0, average_rating: 0 },
    recent_activity: []
  });
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const data = await response.json();
        console.log(data)
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch orders by month data
  useEffect(() => {
    const fetchOrdersByMonth = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/orders/monthly');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders by month');
        }
        
        const data = await response.json();
        setOrdersByMonth(data);
      } catch (err) {
        console.error('Error fetching orders by month:', err);
      }
    };

    fetchOrdersByMonth();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Format time to display
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date to display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-orange-800 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <svg className="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-orange-700 mb-4 font-medium">Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Find the maximum order count for scaling the bars
  const maxOrders = ordersByMonth.length > 0 
    ? Math.max(...ordersByMonth.map(item => item.count), 1) 
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-orange-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-green-700 mt-2">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white rounded-xl shadow-sm p-3 flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-orange-800 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        { (user?.role === 'admin' || user?.role === 'admin') && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-orange-800">{stats.orders.total}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${stats.orders.difference >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
              {stats.orders.difference >= 0 ? '+' : ''}{stats.orders.difference} from yesterday
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Products</p>
                <p className="text-2xl font-bold text-green-800">{stats.products.total}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">All in stock</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-800">{stats.orders.pending}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">Needs attention</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">Reviews</p>
                <p className="text-2xl font-bold text-green-800">{stats.reviews.total}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">{stats.reviews.average_rating} avg rating</p>
          </div>
        </div>)}

        {/* Orders by Month Bar Chart */}
        {ordersByMonth.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-orange-900 mb-4">Orders by Month</h2>
            <div className="flex items-end justify-between h-64 mt-6">
              {ordersByMonth.map((monthData, index) => (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="relative flex flex-col items-center group">
                    <div 
                      className="w-8 bg-orange-400 hover:bg-orange-500 transition-all duration-200 rounded-t"
                      style={{ 
                        height: `${maxOrders ? (monthData.count / maxOrders) * 90 : 0}%`,
                        minHeight: monthData.count > 0 ? '4px' : '0'
                      }}
                    ></div>
                    <div className="mt-2 text-xs text-gray-500">{monthData.month}</div>
                    <div className="absolute top-0 flex-col items-center hidden mb-6 group-hover:flex">
                      <div className="relative z-10 p-2 text-xs leading-none text-white bg-gray-800 rounded shadow-lg">
                        {monthData.count} orders
                      </div>
                      <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           { (user?.role === 'admin' || user?.role === 'admin') && (
          <>
          <h2 className="text-xl font-bold text-orange-900 mb-4">Quick Actions</h2>
           <Link 
              to="/orders" 
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-orange-200 hover:border-orange-300 group"
            >
              <div className="flex items-center mb-3">
                <div className="bg-orange-100 p-2 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-orange-900">Order Management</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">View and update fish orders and delivery status</p>
              <div className="flex items-center text-orange-600 font-medium">
                <span>Manage Orders</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
            <Link 
                  to="/riders" 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200 hover:border-blue-400 group transform hover:-translate-y-1"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl mr-3 group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300 shadow-sm">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 group-hover:text-indigo-900 transition-colors duration-300">Riders Management</h3>
                  </div>
                  <p className="text-blue-700 text-sm mb-4 font-medium">Manage delivery personnel and assignments</p>
                  <div className="flex items-center text-blue-600 font-semibold group-hover:text-indigo-700 transition-colors duration-300">
                    <span>View Riders</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              </>)}

            {user?.role === 'admin' && (
              <>
                <Link 
                  to="/products" 
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-green-200 hover:border-green-300 group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900">Product Management</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Manage fish products and options in your inventory</p>
                  <div className="flex items-center text-green-600 font-medium">
                    <span>Manage Products</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>

                <Link 
                  to="/reviews" 
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-orange-200 hover:border-orange-300 group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3 group-hover:bg-orange-200 transition-colors">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-orange-900">Customer Reviews</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Read and manage customer feedback and reviews</p>
                  <div className="flex items-center text-orange-600 font-medium">
                    <span>View Reviews</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>              
              </>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        { (user?.role === 'admin' || user?.role === 'admin') && (
          <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-orange-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>)}
      </div>
    </div>
  );
};

export default Dashboard;