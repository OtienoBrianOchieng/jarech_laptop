import { useState, useEffect } from 'react';
import ProductList from '../components/Products/ProductList';
import ProductForm from '../components/Products/ProductForm';
import { fetchProducts } from '../api/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setError('');
      } catch (err) {
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSuccessMessage('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setSuccessMessage('Product updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProductCreated = (newProduct) => {
    setProducts([...products, newProduct]);
    setSuccessMessage('Product created successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProductDeleted = (id) => {
    setProducts(products.filter(p => p.id !== id));
    setSuccessMessage('Product deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-orange-800 font-medium">Loading products...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4 md:p-6">
      <div className=" mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-800">Fish Products Management</h1>
             </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                {products.length} product{products.length !== 1 ? 's' : ''} in inventory
              </span>
            </div>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Product Form Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              
              <h2 className="text-xl font-semibold text-orange-900">
                {editingProduct ? 'Edit Fish Product' : 'Add New Fish Product'}
              </h2>
            </div>
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-200">
              <ProductForm 
                product={editingProduct} 
                onCancel={handleCancelEdit} 
                onProductUpdated={handleProductUpdated} 
                onProductCreated={handleProductCreated} 
              />
            </div>
          </div>
          
          {/* Product List Section */}
          <div>
            <ProductList 
              products={products} 
              onEdit={handleEdit} 
              onDelete={handleProductDeleted} 
            />
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center text-sm text-orange-700 opacity-75 mt-8">
          <p>Seafood Inventory Management System • Fresh from the market to your table</p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;