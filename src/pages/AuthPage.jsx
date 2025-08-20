import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Signup from '../components/Auth/Signup';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signup');
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <div className="flex mb-6 border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'signup' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>

      {activeTab === 'signup' && <Signup />}
    </div>
  );
};

export default AuthPage;