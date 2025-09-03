import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RiderDeliveryPage = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryCodes, setDeliveryCodes] = useState({});
  const [verifying, setVerifying] = useState({});
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    filterData();
  }, [data, activeTab, searchTerm]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage('');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      let response;
      let endpoint;
      
      if (user.role === 'admin') {
        endpoint = '/api/admin/rider-assignments';
      } else if (user.role === 'rider') {
        endpoint = `/api/riders/${user.id}/orders`;
      } else {
        throw new Error('Unauthorized access');
      }
      
      response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      
      const result = await response.json();
      
      if (user.role === 'admin') {
        // Admin gets assignments array
        setData(result.assignments || []);
      } else {
        // Rider gets orders array
        setData(result.orders || []);
      }
      
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    try {
      let filtered = data.filter(item => {
        if (user.role === 'admin') {
          // For admin: item is an assignment with order_details and rider_details
          const order = item.order_details;
          const assignment = item;
          
          if (!order || !assignment) return false;
          
          const tabFilter = activeTab === 'active' 
            ? assignment.status !== 'delivered'
            : assignment.status === 'delivered';
          
          if (searchTerm.trim() === '') {
            return tabFilter;
          }
          
          const term = searchTerm.toLowerCase().trim();
          const orderIdMatch = order.id?.toString().toLowerCase().includes(term);
          const phoneMatch = order.customer_phone?.toLowerCase().includes(term);
          
          return tabFilter && (orderIdMatch || phoneMatch);
        } else {
          // For rider: item is an order with rider_assignments
          const order = item;
          const assignment = item.rider_assignments?.[0];
          
          if (!order || !assignment) return false;
          
          const tabFilter = activeTab === 'active' 
            ? assignment.status !== 'delivered'
            : assignment.status === 'delivered';
          
          if (searchTerm.trim() === '') {
            return tabFilter;
          }
          
          const term = searchTerm.toLowerCase().trim();
          const orderIdMatch = order.id?.toString().toLowerCase().includes(term);
          const phoneMatch = order.customer_phone?.toLowerCase().includes(term);
          
          return tabFilter && (orderIdMatch || phoneMatch);
        }
      });
      
      setFilteredData(filtered);
    } catch (err) {
      console.error('Filter data error:', err);
      setFilteredData([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleCodeChange = (assignmentId, code) => {
    setDeliveryCodes(prev => ({
      ...prev,
      [assignmentId]: code
    }));
  };

  const verifyDeliveryCode = async (assignmentId) => {
    try {
      clearMessages();
      setVerifying(prev => ({ ...prev, [assignmentId]: true }));
      
      const code = deliveryCodes[assignmentId]?.trim();
      if (!code) {
        throw new Error('Please enter a delivery code');
      }

      const response = await fetch(`/api/order-riders/${assignmentId}/verify-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delivery_code: code })
      });

      const result = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(result.error || `Verification failed (${response.status})`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Invalid delivery code');
      }

      // Update local state
      setData(prevData => 
        prevData.map(item => {
          if (user.role === 'admin') {
            // For admin: update assignment status
            if (item.id === assignmentId) {
              return {
                ...item,
                status: 'delivered',
                delivered_at: new Date().toISOString()
              };
            }
          } else {
            // For rider: update rider assignment status within order
            if (item.rider_assignments && item.rider_assignments.some(ra => ra.id === assignmentId)) {
              return {
                ...item,
                rider_assignments: item.rider_assignments.map(ra => 
                  ra.id === assignmentId 
                    ? { ...ra, status: 'delivered', delivered_at: new Date().toISOString() }
                    : ra
                )
              };
            }
          }
          return item;
        })
      );

      setDeliveryCodes(prev => ({
        ...prev,
        [assignmentId]: ''
      }));

      setSuccessMessage('Delivery verified successfully!');
      
    } catch (err) {
      setError(err.message);
      console.error('Verification error:', err);
    } finally {
      setVerifying(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const getOrderDetails = (item) => {
    try {
      if (user.role === 'admin') {
        return item.order_details || {};
      } else {
        return item || {};
      }
    } catch (err) {
      console.error('Error getting order details:', err);
      return {};
    }
  };

  const getRiderAssignment = (item) => {
    try {
      if (user.role === 'admin') {
        return item; // For admin, the item itself is the assignment
      } else {
        return item.rider_assignments?.[0] || {}; // For rider, get from order
      }
    } catch (err) {
      console.error('Error getting rider assignment:', err);
      return {};
    }
  };

  const getAssignmentId = (item) => {
    try {
      if (user.role === 'admin') {
        return item.id; // For admin, use assignment ID
      } else {
        return item.rider_assignments?.[0]?.id || null; // For rider, get from assignment
      }
    } catch (err) {
      console.error('Error getting assignment ID:', err);
      return null;
    }
  };

  const getRiderDetails = (item) => {
    try {
      if (user.role === 'admin') {
        return item.rider_details || {}; // For admin, get rider_details
      } else {
        const assignment = item.rider_assignments?.[0];
        return assignment?.rider || {}; // For rider, get rider from assignment
      }
    } catch (err) {
      console.error('Error getting rider details:', err);
      return {};
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 text-lg mb-4">Please log in to access delivery management</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading {user.role === 'admin' ? 'all assignments' : 'your orders'}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-green-700 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Delivery Management</h1>
            <p className="text-sm opacity-90">
              {user.role === 'admin' ? 'All Delivery Assignments' : 'Your Delivery Orders'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            {user.role === 'rider' && (
              <p className="text-xs opacity-90">{user.bike_number_plate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={clearMessages}
                className="absolute top-0 right-0 p-2"
              >
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-2">
              <span className="block sm:inline">{successMessage}</span>
              <button
                onClick={clearMessages}
                className="absolute top-0 right-0 p-2"
              >
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Order ID or Customer phone"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Deliveries
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 极速5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 极速00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <p className="text-gray-500 mb-3">
              {searchTerm.trim() !== '' 
                ? 'No orders found matching your search criteria.'
                : activeTab === 'active' 
                  ? (user.role === 'admin' ? 'No active delivery assignments.' : 'No active orders assigned to you.')
                  : (user.role === 'admin' ? 'No completed deliveries.' : 'You haven\'t completed any deliveries yet.')
              }
            </p>
            {searchTerm.trim() !== '' && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Clear Search
              </button>
            )}
            {error && (
              <button
                onClick={fetchData}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map(item => {
              const order = getOrderDetails(item);
              const riderAssignment = getRiderAssignment(item);
              const assignmentId = getAssignmentId(item);
              const riderDetails = getRiderDetails(item);
              
              if (!assignmentId) {
                console.error('Invalid assignment:', item);
                return null;
              }

              return (
                <div key={assignmentId} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Delivery Header */}
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          Assignment ID: {assignmentId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at || riderAssignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        riderAssignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        riderAssignment.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        riderAssignment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {riderAssignment.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Content */}
                  <div className="p-4">
                    {/* Customer Information */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                        Customer
                      </h4>
                      <p className="text-gray-800 font-medium">{order.customer_name || 'N/A'}</p>
                      <p className="text-gray-600">{order.customer_phone || 'N/A'}</p>
                      <p className="text-gray-600 mt-1 text-sm">{order.delivery_address || 'No address provided'}</p>
                    </div>
                    
                    {/* Order Details */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        Order Details
                      </h4>
                      {order.product && (
                        <p className="text-gray-800">
                          {order.product.name} - {order.selected_option_label}
                        </p>
                      )}
                      <p className="text-gray-600">Quantity: {order.quantity || 1}</p>
                      <p className="text-gray-800 font-medium mt-1">
                        Total: KES {order.total_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>

                    {/* Assignment Info (for admin) */}
                    {user.role === 'admin' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Assignment Details</h4>
                        <p className="text-gray-600">Assignment ID: {assignmentId}</p>
                        <p className="text-gray-600">Delivery Code: {riderAssignment.delivery_code || 'N/A'}</p>
                        <p className="text-gray-600">Rider: {riderDetails.name || 'N/A'} ({riderDetails.bike_number_plate || 'N/A'})</p>
                        <p className="text-gray-600 text-sm">
                          Assigned: {new Date(riderAssignment.assigned_at).toLocaleString()}
                        </p>
                        {riderAssignment.delivered_at && (
                          <p className="text-gray-600 text-sm">
                            Delivered: {new Date(riderAssignment.delivered_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Delivery Verification (for riders only) */}
                    {user.role === 'rider' && riderAssignment.status !== 'delivered' && (
                      <div className="pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Verification</h4>
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={deliveryCodes[assignmentId] || ''}
                            onChange={(e) => handleCodeChange(assignmentId, e.target.value)}
                            placeholder="Enter delivery code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={verifying[assignmentId]}
                          />
                          <button
                            onClick={() => verifyDeliveryCode(assignmentId)}
                            disabled={!deliveryCodes[assignmentId] || verifying[assignmentId]}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            {verifying[assignmentId] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="极速 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                              </>
                            ) : 'Verify Delivery'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Delivered Status */}
                    {riderAssignment.status === 'delivered' && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="font-medium">Delivered Successfully</span>
                        </div>
                        {riderAssignment.delivered_at && (
                          <p className="text-gray-500 text-sm mt-1">
                            Delivered at: {new Date(riderAssignment.delivered_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation for Riders */}
      {user.role === 'rider' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
          <div className="flex justify-between items-center">
            <button 
              onClick={fetchData}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m极速 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={logout}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDeliveryPage;