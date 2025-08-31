import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RiderDeliveryPage = () => {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryCodes, setDeliveryCodes] = useState({});
  const [verifying, setVerifying] = useState({});
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, activeTab, searchTerm]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      let response;
      if (user.role === 'admin') {
        response = await fetch('/api/admin/rider-assignments');
      } else if (user.role === 'rider') {
        response = await fetch(`/api/riders/${user.id}/orders`);
      } else {
        throw new Error('Unauthorized access');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      
      if (user.role === 'admin') {
        setAssignments(data.assignments || []);
      } else {
        setAssignments(data.orders || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments.filter(assignment => {
      const order = user.role === 'admin' ? assignment.order_details : assignment;
      const riderAssignment = user.role === 'rider' 
        ? assignment.rider_assignments?.[0] 
        : assignment;
      
      // Filter by active tab
      const tabFilter = activeTab === 'active' 
        ? riderAssignment?.status !== 'delivered'
        : riderAssignment?.status === 'delivered';
      
      // If no search term, return tab filter result
      if (searchTerm.trim() === '') {
        return tabFilter;
      }
      
      // Convert search term to lowercase for case-insensitive search
      const term = searchTerm.toLowerCase().trim();
      
      // Check if order exists and has the required properties
      if (!order) return false;
      
      // Search by Order ID
      const orderIdMatch = order.id?.toString().toLowerCase().includes(term);
      
      // Search by Customer phone number
      const phoneMatch = order.customer_phone?.toLowerCase().includes(term);
      
      return tabFilter && (orderIdMatch || phoneMatch);
    });
    
    setFilteredAssignments(filtered);
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

  const verifyDeliveryCode = async (assignmentId, orderId) => {
    try {
      setVerifying(prev => ({ ...prev, [assignmentId]: true }));
      
      const response = await fetch(`/api/order-riders/${assignmentId}/verify-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delivery_code: deliveryCodes[assignmentId]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAssignments(prevAssignments => 
          prevAssignments.map(assignment => 
            assignment.id === assignmentId 
              ? { 
                  ...assignment, 
                  status: 'delivered',
                  delivered_at: new Date().toISOString()
                } 
              : assignment
          )
        );
        alert('Delivery code verified successfully!');
      } else {
        alert('Invalid delivery code');
      }
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setVerifying(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500 text-lg">Please log in to access delivery management.</p>
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchAssignments} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get order details based on user role
  const getOrderDetails = (assignment) => {
    if (user.role === 'admin') {
      return assignment.order_details;
    } else {
      return assignment;
    }
  };

  // Helper function to get rider details based on user role
  const getRiderDetails = (assignment) => {
    if (user.role === 'admin') {
      return assignment.rider_details;
    } else {
      return user;
    }
  };

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
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Deliveries
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <p className="text-gray-500">
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
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map(assignment => {
              const order = getOrderDetails(assignment);
              const rider = getRiderDetails(assignment);
              
              const riderAssignment = user.role === 'rider' 
                ? assignment.rider_assignments?.[0] 
                : assignment;
              
              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Delivery Header */}
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">Order #{order?.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order?.created_at || assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        riderAssignment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        riderAssignment?.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        riderAssignment?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {riderAssignment?.status || 'unknown'}
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
                      <p className="text-gray-800 font-medium">{order?.customer_name}</p>
                      <p className="text-gray-600">{order?.customer_phone}</p>
                      <p className="text-gray-600 mt-1 text-sm">{order?.delivery_address}</p>
                    </div>
                    
                    {/* Order Details */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        Order Details
                      </h4>
                      {order?.product && (
                        <p className="text-gray-800">
                          {order.product.name} - {order.selected_option_label}
                        </p>
                      )}
                      <p className="text-gray-600">Quantity: {order?.quantity}</p>
                      <p className="text-gray-800 font-medium mt-1">
                        Total: KES {order?.total_price?.toFixed(2)}
                      </p>
                    </div>

                    {/* Assignment Info (for admin) */}
                    {user.role === 'admin' && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Assignment Details</h4>
                        <p className="text-gray-600">Delivery Code: {riderAssignment?.delivery_code}</p>
                        <p className="text-gray-600 text-sm">
                          Assigned: {new Date(riderAssignment?.assigned_at).toLocaleString()}
                        </p>
                        {riderAssignment?.delivered_at && (
                          <p className="text-gray-600 text-sm">
                            Delivered: {new Date(riderAssignment.delivered_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Delivery Verification (for riders only) */}
                    {user.role === 'rider' && riderAssignment && riderAssignment.status !== 'delivered' && (
                      <div className="pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Verification</h4>
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={deliveryCodes[assignment.id] || ''}
                            onChange={(e) => handleCodeChange(assignment.id, e.target.value)}
                            placeholder="Enter delivery code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => verifyDeliveryCode(assignment.id, order.id)}
                            disabled={!deliveryCodes[assignment.id] || verifying[assignment.id]}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                          >
                            {verifying[assignment.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    {riderAssignment?.status === 'delivered' && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center text-green-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="font-medium">Delivered Successfully</span>
                        </div>
                        {riderAssignment?.delivered_at && (
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
              onClick={fetchAssignments}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <button 
              onClick={logout}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
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