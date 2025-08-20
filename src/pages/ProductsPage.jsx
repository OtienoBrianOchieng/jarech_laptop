import { useState, useEffect } from 'react';
import ProductList from '../components/Products/ProductList';
import ProductForm from '../components/Products/ProductForm';
import { fetchProducts } from '../api/products';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  const handleProductCreated = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const handleProductDeleted = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fish Products Management</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Fish Product'}
        </h2>
        <ProductForm 
          product={editingProduct} 
          onCancel={handleCancelEdit} 
          onProductUpdated={handleProductUpdated} 
          onProductCreated={handleProductCreated} 
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Fish Products</h2>
        <ProductList 
          products={products} 
          onEdit={handleEdit} 
          onDelete={handleProductDeleted} 
        />
      </div>
    </div>
  );
};

export default ProductsPage;