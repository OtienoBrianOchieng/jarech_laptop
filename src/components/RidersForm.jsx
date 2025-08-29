import React, { useState } from "react";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

const RidersForm = ({ onRiderAdded, showCancelButton = false, onCancel }) => {
  const [form, setForm] = useState({
    fullname: "",
    phonenumber: "",
    bike_number_plate: "",
    is_active: true,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();

  // Check if user has seller role
  const isSeller = user?.role === 'seller';

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }
    
    if (!form.phonenumber.trim()) {
      newErrors.phonenumber = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,}$/.test(form.phonenumber)) {
      newErrors.phonenumber = "Please enter a valid phone number";
    }
    
    if (!form.bike_number_plate.trim()) {
      newErrors.bike_number_plate = "Bike number plate is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const res = await axios.post("http://localhost:5000/riders", form);
      setMessage({ type: "success", text: res.data.message });
      setForm({ fullname: "", phonenumber: "", bike_number_plate: "", is_active: true });
      
      // Notify parent component if callback provided
      if (onRiderAdded) {
        onRiderAdded();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // If user is not a seller, show access denied message
  if (isSeller) {
    return (
    
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200 p-6 text-center">
            <div className="bg-orange-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-orange-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              Only Admin can add new riders. Please contact an administrator if you need access.
            </p>
            <div className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p>Your current role: <span className="font-medium capitalize">{user?.role || 'unknown'}</span></p>
            </div>
            {showCancelButton && (
              <button
                onClick={handleCancel}
                className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
            <div className="bg-white p-3 rounded-full inline-flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Add New Rider</h2>
            <p className="text-orange-100 mt-1">Register a new delivery rider</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Enter rider's full name"
                  value={form.fullname}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.fullname ? "border-red-500" : "border-orange-200"
                  }`}
                  disabled={loading}
                />
                {errors.fullname && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="phonenumber"
                  placeholder="e.g., +254 712 345 678"
                  value={form.phonenumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.phonenumber ? "border-red-500" : "border-orange-200"
                  }`}
                  disabled={loading}
                />
                {errors.phonenumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phonenumber}</p>
                )}
              </div>

              {/* Bike Number Plate Field */}
              <div>
                <label className="block text-sm font-medium text-orange-900 mb-2">
                  Bike Number Plate *
                </label>
                <input
                  type="text"
                  name="bike_number_plate"
                  placeholder="e.g., KBC 123A"
                  value={form.bike_number_plate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.bike_number_plate ? "border-red-500" : "border-orange-200"
                  }`}
                  disabled={loading}
                />
                {errors.bike_number_plate && (
                  <p className="mt-1 text-sm text-red-600">{errors.bike_number_plate}</p>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <label className="block text-sm font-medium text-orange-900 mb-1">
                    Rider Status
                  </label>
                  <p className="text-sm text-orange-700">
                    {form.is_active ? "Active - Can receive orders" : "Inactive - Cannot receive orders"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Message Display */}
              {message.text && (
                <div className={`p-3 rounded-lg ${
                  message.type === "success" 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  <div className="flex items-center">
                    <svg className={`w-5 h-5 mr-2 ${
                      message.type === "success" ? "text-green-600" : "text-red-600"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {message.type === "success" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                    <span className="text-sm">{message.text}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Rider
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Form Tips */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quick Tips
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Ensure phone number is correct for order notifications</li>
                <li>• Verify bike number plate matches official documents</li>
                <li>• Set status to inactive for riders on leave</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidersForm;