import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import ReviewsPage from './pages/ReviewsPage';
import RidersPage from './pages/RidersPage';
import RiderDeliveryPage from './pages/RiderDeliveryPage';
import ManageUsersPage from './pages/ManageUsersPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path = "/riders" element = {<RidersPage />} />
              <Route path = "/deliveries" element = {<RiderDeliveryPage />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path = "/users" element = {<ManageUsersPage />} />
              
            </Route>
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;