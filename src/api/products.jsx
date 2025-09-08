export const fetchProducts = async () => {
  const response = await fetch('http://127.0.0.1:5000/fish-products', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });
  if (!response.ok) throw new Error('Failed to fetch products');
  console.log(response.data)
  return response.json();
};

export const createProduct = async (productData) => {
  const response = await fetch('http://127.0.0.1:5000/fish-products', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`http://127.0.0.1:5000/fish-products/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`/api/fish-products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

export const updateProductCount = async (id, quantity) => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/products/${id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update product count');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product count:', error);
    throw error;
  }
};