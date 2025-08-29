import { useState, useEffect } from "react";
import { updateOrderStatus, updateDeliveryInfo } from "../../api/orders";

const OrderList = ({ orders, onStatusUpdate, onDeliveryUpdate }) => {
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      onStatusUpdate(updatedOrder);
    } catch {
      alert("Failed to update order status");
    }
  };

  const handleDeliveryEdit = (order) => {
    setEditingDelivery(order.id);
    setDeliveryAddress(order.notes || "");
  };

  const handleDeliveryCancel = () => {
    setEditingDelivery(null);
  };

  const handleDeliverySubmit = async (orderId) => {
    try {
      const updatedOrder = await updateDeliveryInfo(orderId, {
        notes: deliveryAddress,
      });
      onDeliveryUpdate(updatedOrder);
      setEditingDelivery(null);
    } catch {
      alert("Failed to update delivery info");
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toString().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone?.includes(searchTerm) ||
                         order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-indigo-100 text-indigo-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  /** ------------------ SEARCH AND FILTER BAR ------------------ */
  const searchBar = (
    <div className="p-4 bg-gradient-to-r from-orange-50 to-green-50 border-b border-orange-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Order ID, Phone or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-orange-300 rounded-lg bg-white placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-orange-500 hover:text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-orange-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-orange-800"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-orange-800 font-medium flex items-center justify-center md:justify-end">
          <span className="bg-orange-500 text-white rounded-full px-3 py-1 text-sm">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );

  /** ------------------ FIXED DESKTOP VIEW ------------------ */
  const desktopView = (
    <div className="p-4 bg-gradient-to-b from-orange-50 to-green-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <tr>
                {[
                  "Order ID", "Created", "Product", "Option", "Qty", "Total", 
                  "Payment", "Reference", "Status", "Phone", "Delivery", "Order Status", "Notes", "Actions"
                ].map((heading) => (
                  <th
                    key={heading}
                    className="py-4 px-4 text-left font-semibold text-sm uppercase tracking-wider whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-orange-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-orange-900 whitespace-nowrap">#{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap max-w-xs truncate">{order.product?.name}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap max-w-xs truncate">{order.selected_option_label}</td>
                    <td className="py-3 px-4 text-sm text-center whitespace-nowrap">{order.quantity}</td>
                    <td className="py-3 px-4 text-sm font-medium whitespace-nowrap">Ksh {order.total_price}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">{order.payment_method}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap max-w-xs truncate">
                      {order.payment_reference || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {order.payment_method === 'M-PESA' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.payment_status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                          On delivery
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">{order.customer_phone}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap max-w-xs truncate">{order.delivery_address}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`p-2 border rounded text-sm w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {editingDelivery === order.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <textarea
                            placeholder="Add notes about this order"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full p-2 border border-orange-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeliverySubmit(order.id)}
                              className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 transition-colors flex-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleDeliveryCancel}
                              className="bg-gray-400 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-500 transition-colors flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-[120px]">
                          {order.notes ? (
                            <div className="max-w-sm truncate text-sm p-2 bg-orange-50 rounded border border-orange-200">
                              {order.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {editingDelivery !== order.id && (
                        <button
                          onClick={() => handleDeliveryEdit(order)}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-600 transition-colors whitespace-nowrap"
                        >
                          Add Notes
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="py-8 text-center text-orange-700">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-orange-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">No orders found matching your criteria.</p>
                      <button
                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /** ------------------ MOBILE/TABLET VIEW ------------------ */
  const mobileView = (
    <div className="p-4 space-y-4 bg-gradient-to-b from-orange-50 to-green-50 min-h-screen">
      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200"
          >
            {/* Header */}
            <div
              className="p-4 flex justify-between items-center cursor-pointer bg-gradient-to-r from-orange-50 to-orange-100"
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div>
                <div className="font-bold text-orange-900">Order #{order.id}</div>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="ml-2 text-xs text-orange-700">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-orange-500">
                {expandedOrder === order.id ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {/* Expanded content */}
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 bg-orange-50">
                <div className="grid grid-cols-1 gap-3 mb-4 pt-3">
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Product</div>
                    <div className="text-sm font-medium">{order.product?.name}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Option</div>
                    <div className="text-sm font-medium">{order.selected_option_label}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Quantity</div>
                    <div className="text-sm font-medium">{order.quantity}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Total</div>
                    <div className="text-sm font-medium">Ksh {order.total_price}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Payment Method</div>
                    <div className="text-sm font-medium">{order.payment_method}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Payment Status</div>
                    <div className="text-sm font-medium">
                      {order.payment_method === 'M-PESA' ? order.payment_status : 'On delivery'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Phone</div>
                    <div className="text-sm font-medium">{order.customer_phone}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="text-xs text-orange-600 mb-1">Delivery Address</div>
                    <div className="text-sm font-medium">{order.delivery_address}</div>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="text-xs text-orange-700 font-medium mb-2">Update Status</div>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Delivery Info */}
                <div className="mb-4">
                  <div className="text-xs text-orange-700 font-medium mb-2">
                    Order Notes
                  </div>
                  {editingDelivery === order.id ? (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Add notes about this order..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows="3"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDeliverySubmit(order.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex-1 hover:bg-green-600 transition-colors"
                        >
                          Save Notes
                        </button>
                        <button
                          onClick={handleDeliveryCancel}
                          className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm flex-1 hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {order.notes ? (
                        <div className="p-3 bg-white border border-orange-200 rounded-lg text-sm">
                          {order.notes}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          No notes added yet
                        </span>
                      )}
                      <button
                        onClick={() => handleDeliveryEdit(order)}
                        className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm w-full hover:bg-orange-600 transition-colors"
                      >
                        {order.notes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 text-center border border-orange-200">
          <svg className="w-16 h-16 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-orange-700 mb-4 font-medium">No orders found matching your criteria.</div>
          <button
            onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-orange-50 to-green-50">
      {searchBar}
      {isDesktop ? desktopView : mobileView}
    </div>
  );
};

export default OrderList;