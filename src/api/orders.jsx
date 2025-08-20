export const fetchOrders = async () => {
  console.log('Fetching orders from /fish-orders');
  
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  console.log('Token:', token); // Debug: check if token exists
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    // Use the correct endpoint that matches your Flask backend
    const response = await fetch('http://127.0.0.1:5000/fish-orders', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Response status:', response.status); // Debug: check response status
    
    if (response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders. Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Orders data received:', data); // Debug: check what data is returned
    return data;
  } catch (error) {
    console.error('Error in fetchOrders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`http://127.0.0.1:5000/fish-orders/${orderId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
};

export const updateDeliveryInfo = async (orderId, deliveryInfo) => {
  const response = await fetch(`http://127.0.0.1:5000/fish-orders/${orderId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ 

      notes: deliveryInfo
    }),
  });
  if (!response.ok) throw new Error('Failed to update delivery info');
  return response.json();
};