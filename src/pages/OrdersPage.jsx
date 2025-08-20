import { useState, useEffect } from 'react';
import OrderList from '../components/Orders/OrderList';
import { fetchOrders } from '../api/orders';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleDeliveryUpdate = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fish Orders Management</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Order List</h2>
        <OrderList 
          orders={orders} 
          onStatusUpdate={handleStatusUpdate} 
          onDeliveryUpdate={handleDeliveryUpdate} 
        />
      </div>
    </div>
  );
};

export default OrdersPage;