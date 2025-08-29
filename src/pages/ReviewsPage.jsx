import React from 'react';
import Reviews from '../components/Reviews/Reviews';


const ReviewsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple page header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Customer Reviews</h1>
        </div>
      </header>
      
      {/* Reviews component */}
      <Reviews />
    </div>
  );
};

export default ReviewsPage;