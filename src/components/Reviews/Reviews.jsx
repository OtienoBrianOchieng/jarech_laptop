import React, { useState, useEffect, useCallback } from "react";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString();

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
  const updateReviewStatus = useCallback(async (reviewId) => {
    try {
      await fetch(`http://127.0.0.1:5000/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: "read" } : r))
      );
    } catch {
      setError("Failed to update review status.");
    }
  }, []);

  // Open review
  const handleReviewClick = (review) => {
    setSelectedReview(review);
    if (review.status === "unread") updateReviewStatus(review.id);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
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
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
          <button
            onClick={fetchReviews}
            className="bg-white border px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex bg-white border rounded-lg overflow-hidden mb-6">
          {["all", "unread", "read"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {tab === "all" ? reviews.length : tab === "unread" ? unreadCount : readCount})
            </button>
          ))}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900">
                No {activeTab} reviews
              </h3>
              {activeTab !== "all" && (
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 text-blue-600 hover:text-blue-500 text-sm"
                >
                  View all reviews
                </button>
              )}
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg border p-6 cursor-pointer hover:shadow-md ${
                  selectedReview?.id === review.id ? "ring-2 ring-blue-500" : ""
                } ${
                  review.status === "unread" ? "border-l-4 border-blue-500" : ""
                }`}
                onClick={() => handleReviewClick(review)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                      Order #{review.order_id}
                    </span>
                    <div className="flex text-yellow-400 text-sm">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  {review.status === "unread" && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-3 text-gray-700 line-clamp-2">
                  {review.status}
                </p>
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>{formatDate(review.created_at)}</span>
                  <span>{formatTime(review.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Review Details
              </h2>
              <button
                onClick={handleCloseReview}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Order ID:
                    </span>{" "}
                    #{selectedReview.order_id}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Client Phone:
                    </span>{" "}
                    {selectedReview.client_phone || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>{" "}
                    {formatDate(selectedReview.created_at)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>{" "}
                    {formatTime(selectedReview.created_at)}
                  </div>
                </div>
              </div>

              {/* Rating & Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Rating & Status
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex text-yellow-400 text-lg">
                    {"★".repeat(selectedReview.rating)}
                    {"☆".repeat(5 - selectedReview.rating)}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedReview.status === "unread"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedReview.status}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Review Text
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed">
                  {selectedReview.review_text}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={handleCloseReview}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
