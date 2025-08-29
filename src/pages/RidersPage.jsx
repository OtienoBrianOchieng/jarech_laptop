import React from "react";
import RidersForm from "../components/RidersForm";
import RiderList from "../components/RiderList";


const RidersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl font-extrabold text-center text-green-700">
          🏍 Rider Management
        </h1>
        <p className="text-center text-gray-600">
          Add new riders, manage their details, and track assigned orders
        </p>

        {/* Rider Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-orange-500">
          <RidersForm />
        </div>

        {/* Rider List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500">
          <RiderList />
        </div>
      </div>
    </div>
  );
};

export default RidersPage;
