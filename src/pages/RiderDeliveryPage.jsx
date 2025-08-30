import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const RiderDeliveryPage = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryCodes, setDeliveryCodes] = useState({});
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    if (user && user.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/riders/${user.id}/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (orderId, code) => {
    setDeliveryCodes(prev => ({
      ...prev,
      [orderId]: code
    }));
  };

  const verifyDeliveryCode = async (orderId, assignmentId) => {
    try {
      setVerifying(prev => ({ ...prev, [orderId]: true }));
      
      const response = await fetch(`/api/order-riders/${assignmentId}/verify-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delivery_code: deliveryCodes[orderId]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update the order status locally
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'delivered' } 
              : order
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
      setVerifying(prev => ({ ...prev, [orderId]: false }));
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
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Your Delivery Orders</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-gray-600">
              Welcome, {user.name} ({user.bike_number_plate})
            </span>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-blue-700 text-lg">No orders assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map(order => {
              const assignment = order.rider_assignments?.find(a => a.rider_id === parseInt(user.id));
              
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {/* Customer Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Customer Information</h4>
                      <p className="text-gray-800">{order.customer_name}</p>
                      <p className="text-gray-600">{order.customer_phone}</p>
                      <p className="text-gray-600 mt-1">{order.delivery_address}</p>
                    </div>
                    
                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Order Details</h4>
                      {order.product && (
                        <p className="text-gray-800">
                          {order.product.name} - {order.selected_option_label}
                        </p>
                      )}
                      <p className="text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-gray-800 font-medium mt-1">
                        Total: KES {order.total_price?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Delivery Verification */}
                  {assignment && order.status !== 'delivered' && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Verification</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={deliveryCodes[order.id] || ''}
                          onChange={(e) => handleCodeChange(order.id, e.target.value)}
                          placeholder="Enter delivery code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => verifyDeliveryCode(order.id, assignment.id)}
                          disabled={!deliveryCodes[order.id] || verifying[order.id]}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                        >
                          {verifying[order.id] ? 'Verifying...' : 'Verify Delivery'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivered Status */}
                  {order.status === 'delivered' && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-medium">Delivered</span>
                      </div>
                      {assignment?.delivered_at && (
                        <p className="text-gray-500 text-sm mt-1">
                          Delivered at: {new Date(assignment.delivered_at).toLocaleString()}
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