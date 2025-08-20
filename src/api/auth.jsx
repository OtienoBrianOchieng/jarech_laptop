export const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me', {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
  });
  if (!response.ok) throw new Error('Not authenticated');
  return response.json();
};