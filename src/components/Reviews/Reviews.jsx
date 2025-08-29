import React, { useState, useEffect, useCallback } from "react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://127.0.0.1:5000/reviews");
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      console.log(data.reviews)
      setReviews(
        (data.reviews || []).map((review) => ({
          ...review,
          status: review.status || "unread",
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update review status
  const updateReviewStatus = useCallback(async (reviewId, newStatus) => {
    try {
      await fetch(`http://127.0.0.1:5000/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
      // Also update selected review if it's the one being modified
      if (selectedReview && selectedReview.id === reviewId) {
        setSelectedReview({...selectedReview, status: newStatus});
      }
    } catch {
      setError("Failed to update review status.");
    }
  }, [selectedReview]);

  // Open review
  const handleReviewClick = (review) => {
    setSelectedReview(review);
    if (review.status === "unread") updateReviewStatus(review.id, "read");
  };

  const handleCloseReview = () => setSelectedReview(null);

  // Filtering
  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((r) => r.status === activeTab);

  const unreadCount = reviews.filter((r) => r.status === "unread").length;
  const readCount = reviews.filter((r) => r.status === "read").length;

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Customer Reviews</h1>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
        </div>
        <button
          onClick={fetchReviews}
          className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex border-b">
          {[
            { id: "all", label: "All", count: reviews.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "read", label: "Read", count: readCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No {activeTab} reviews
            </h3>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 text-orange-600 hover:text-orange-500 text-sm"
              >
                View all reviews
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr 
                    key={review.id} 
                    className={`hover:bg-gray-50 ${review.status === "unread" ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(review.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex text-yellow-400">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        review.status === "unread" 
                          ? "bg-orange-100 text-orange-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleReviewClick(review)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Review Details
              </h2>
              <button
                onClick={handleCloseReview}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Order ID
                  </h3>
                  <p className="text-sm font-medium text-gray-900">
                    #{selectedReview.order_id}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Date & Time
                  </h3>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedReview.created_at)} •{" "}
                    {new Date(selectedReview.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {selectedReview.client_phone && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Client Phone
                    </h3>
                    <p className="text-sm text-gray-900">
                      {selectedReview.client_phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Rating & Status */}
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Rating
                  </h3>
                  <div className="flex text-yellow-400 text-lg">
                    {"★".repeat(selectedReview.rating)}
                    {"☆".repeat(5 - selectedReview.rating)}
                    <span className="ml-2 text-gray-700 text-base">({selectedReview.rating}/5)</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Status
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedReview.status === "unread"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {selectedReview.status}
                    </span>
                    <button
                      onClick={() => updateReviewStatus(
                        selectedReview.id, 
                        selectedReview.status === "unread" ? "read" : "unread"
                      )}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Mark as {selectedReview.status === "unread" ? "read" : "unread"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Review Text
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  {selectedReview.review_text || "No review text provided."}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => updateReviewStatus(
                  selectedReview.id, 
                  selectedReview.status === "unread" ? "read" : "unread"
                )}
                className={`px-4 py-2 rounded-md text-sm ${
                  selectedReview.status === "unread"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                }`}
              >
                Mark as {selectedReview.status === "unread" ? "Read" : "Unread"}
              </button>
              <button
                onClick={handleCloseReview}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;