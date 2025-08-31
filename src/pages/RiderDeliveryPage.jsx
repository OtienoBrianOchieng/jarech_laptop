import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RiderDeliveryPage = () => {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryCodes, setDeliveryCodes] = useState({});
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    if (user && user.id) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      let response;
      if (user.role === 'admin') {
        // Admin: fetch all rider assignments
        response = await fetch('/api/admin/rider-assignments');
      } else if (user.role === 'rider') {
        // Rider: fetch only their assignments
        response = await fetch(`/api/riders/${user.id}/orders`);
      } else {
        throw new Error('Unauthorized access');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      
      if (user.role === 'admin') {
        // For admin, data comes as { assignments: [...] }
        setAssignments(data.assignments || []);
      } else {
        // For rider, data comes as { orders: [...] } from the previous endpoint
        setAssignments(data.orders || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        // Update the assignment status locally
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Loading {user.role === 'admin' ? 'all assignments' : 'your orders'}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={fetchAssignments} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
      return assignment; // For riders, the assignment is the order itself with rider_assignments
    }
  };

  // Helper function to get rider details based on user role
  const getRiderDetails = (assignment) => {
    if (user.role === 'admin') {
      return assignment.rider_details;
    } else {
      return user; // For riders, use the current user
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            {user.role === 'admin' ? 'All Delivery Assignments' : 'Your Delivery Orders'}
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-gray-600">
              Welcome, {user.name} {user.role === 'rider' && `(${user.bike_number_plate})`}
            </span>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-blue-700 text-lg">
              {user.role === 'admin' ? 'No delivery assignments found.' : 'No orders assigned to you.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map(assignment => {
              const order = getOrderDetails(assignment);
              const rider = getRiderDetails(assignment);
              
              // For riders, find their specific assignment from the order's rider_assignments
              const riderAssignment = user.role === 'rider' 
                ? assignment.rider_assignments?.[0] 
                : assignment;
              
              return (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order?.id}</h3>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        riderAssignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        riderAssignment.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        riderAssignment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {riderAssignment.status}
                      </span>
                      {user.role === 'admin' && rider && (
                        <span className="text-xs text-gray-500">
                          Rider: {rider.name} ({rider.bike_number_plate})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {/* Customer Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Customer Information</h4>
                      <p className="text-gray-800">{order?.customer_name}</p>
                      <p className="text-gray-600">{order?.customer_phone}</p>
                      <p className="text-gray-600 mt-1">{order?.delivery_address}</p>
                    </div>
                    
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Order Details</h4>
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
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Assignment Details</h4>
                        <p className="text-gray-600">Delivery Code: {riderAssignment.delivery_code}</p>
                        <p className="text-gray-600">
                          Assigned: {new Date(riderAssignment.assigned_at).toLocaleString()}
                        </p>
                        {riderAssignment.delivered_at && (
                          <p className="text-gray-600">
                            Delivered: {new Date(riderAssignment.delivered_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delivery Verification (for riders only) */}
                  {user.role === 'rider' && riderAssignment && riderAssignment.status !== 'delivered' && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Verification</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={deliveryCodes[assignment.id] || ''}
                          onChange={(e) => handleCodeChange(assignment.id, e.target.value)}
                          placeholder="Enter delivery code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => verifyDeliveryCode(assignment.id, order.id)}
                          disabled={!deliveryCodes[assignment.id] || verifying[assignment.id]}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                        >
                          {verifying[assignment.id] ? 'Verifying...' : 'Verify Delivery'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivered Status */}
                  {riderAssignment.status === 'delivered' && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-medium">Delivered</span>
                      </div>
                      {riderAssignment.delivered_at && (
                        <p className="text-gray-500 text-sm mt-1">
                          Delivered at: {new Date(riderAssignment.delivered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDeliveryPage;