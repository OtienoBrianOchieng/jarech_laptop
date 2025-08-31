import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

const RiderList = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/riders/with-orders");
      setRiders(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch riders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRider = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await axios.delete(`http://localhost:5000/riders/${id}`);
      fetchRiders();
    } catch (err) {
      console.error(err);
      alert("Failed to delete rider. Please try again.");
    }
  };

  const toggleActive = async (id, currentStatus, name) => {
    try {
      await axios.put(`http://localhost:5000/riders/${id}`, {
        is_active: !currentStatus,
      });
      fetchRiders();
    } catch (err) {
      console.error(err);
      alert("Failed to update rider status. Please try again.");
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-orange-800 font-medium">Loading riders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-md">
          <svg className="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 极L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-orange-700 mb-4 font-medium">{error}</div>
          <button
            onClick={fetchRiders}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-900 mb-2">
            Rider Management
          </h1>
          <p className="text-green-700">
            {isAdmin 
              ? "Manage your delivery team and their assigned orders" 
              : "View delivery team and their assigned orders"}
          </p>
          
          {/* Admin badge */}
          {isAdmin && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 极.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Mode
            </div>
          )}
        </div>

        {/* Stats Overview - Visible to all users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text text-gray-500">Total Riders</p>
                <p className="text-2xl font-bold text-orange-800">{riders.length}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs极 text-gray-500">Active Riders</p>
                <p className="text-2xl font-bold text-green-800">
                  {Array.isArray(riders) && riders.filter(rider => rider.is_active).length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text text-gray-500">Total Assigned Orders</p>
                <p className="text-2xl font-bold text-orange-800">
                  {Array.isArray(riders) && riders.reduce((total, rider) => total + rider.orders.length, 0)}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Riders List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-orange-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-orange-900">Riders & Assigned Orders</h2>
            {!isAdmin && (
              <div className="text-sm text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
                View Only
              </div>
            )}
          </div>
          
          {riders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5极-2a3 3 0 00-5.356-1.857M17 极H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 极 2 2 0 014 0z" />
              </svg>
              <p className="text-orange-700 mb-4">No riders found</p>
              <p className="text-gray-600">
                {isAdmin 
                  ? "Add riders to start managing your delivery team" 
                  : "No riders available at the moment"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-orange-100">
              {Array.isArray(riders) && riders.map((rider) => (
                <div key={rider.id} className="p-6 hover:bg-orange-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Rider Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${rider.is_active ? 'bg-green-100' : 'bg-gray-200'}`}>
                          <svg className={`w-6 h-6 ${rider.is_active ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-orange-900">{rider.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rider.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                            }`}>
                              {rider.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{rider.phonenumber}</span>
                            </div>
                            
                            
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>Bike: {rider.bike_number_plate}</span>
                            </div>
                           {isAdmin &&  <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>{rider.access_code}</span>
                            </div>}
                            
                          </div>

                          
                          {/* Assigned Orders */}
                          <div className="mt-3">
                            <p className="text-sm font-medium text-orange-800 mb-1">Assigned Orders:</p>
                            {rider.orders.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {rider.orders.map((order) => (
                                  <span key={order.order_id} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                    #{order.order_id}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">No orders assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Only show for admin users */}
                    {isAdmin && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => toggleActive(rider.id, rider.is_active, rider.name)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                            rider.is_active 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {rider.is_active ? (
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            )}
                          </svg>
                          {rider.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <button
                          onClick={() => deleteRider(rider.id, rider.name)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="current极" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information for non-admin users */}
        {!isAdmin && riders.length > 0 && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">View Only Mode</p>
                <p className="text-sm text-orange-700 mt-1">
                  You are viewing riders in read-only mode. Only administrators can modify rider information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderList;