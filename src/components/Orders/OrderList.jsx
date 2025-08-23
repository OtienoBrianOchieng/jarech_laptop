import { useState, useEffect } from "react";
import { updateOrderStatus, updateDeliveryInfo } from "../../api/orders";

const OrderList = ({ orders, onStatusUpdate, onDeliveryUpdate }) => {
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(searchTerm.toLowerCase())
  );

  /** ------------------ SEARCH BAR ------------------ */
  const searchBar = (
    <div className="p-4 bg-white border-b">
      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex font-bold items-center pointer-events-none">
              Search
          </div>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block rounded w-full pl-10 p-2 border border-green-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /** ------------------ DESKTOP VIEW ------------------ */
  const desktopView = (
    <div className="p-4 overflow-x-auto">
      <table className="w-full min-w-max bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Order ID",
              "Created",
              "Product",
              "Option",
              "Qty",
              "Total",
              "Payment Method",
              "Mpesa Reference",
              "Payment Status",
              "Phone",
              "Status",
              "Notes",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="py-3 px-4 text-left font-semibold text-gray-700 text-sm"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm">#{order.id}</td>
                <td className="py-3 px-4 text-sm">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm">{order.product?.name}</td>
                
                <td className="py-3 px-4 text-sm">
                  {order.selected_option_label}
                </td>
                <td className="py-3 px-4 text-sm">{order.quantity}</td>
                <td className="py-3 px-4 text-sm">Ksh {order.total_price}</td>
                <td className="py-3 px-4 text-sm">{order.payment_method}</td>
                {order.payment_reference ? (
                  <td className="py-3 px-4 text-sm">{order.payment_reference}</td>
                ) : (
                  <td> - </td>
                )}
                {order.payment_method === 'M-PESA' ? (<div className="text-xs text-black mb-1">{order.payment_status}</div>) : (<div className="text-xs bg-orange-500 text-black mb-1">On delivery</div>) }
                <td className="py-3 px-4 text-sm">{order.customer_phone}</td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="p-2 border rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {editingDelivery === order.id ? (
                    <div className="space-y-2">
                      <textarea
                        placeholder="Delivery Address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows="2"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeliverySubmit(order.id)}
                          className="bg-blue-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleDeliveryCancel}
                          className="bg-gray-500 text-white px-3 py-2 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {order.notes ? (
                        <div className="max-w-sm truncate text-sm">
                          {order.notes}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not set</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingDelivery !== order.id && (
                    <button
                      onClick={() => handleDeliveryEdit(order)}
                      className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Update Notes
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="13" className="py-8 text-center text-gray-500">
                No orders found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  /** ------------------ MOBILE/TABLET VIEW ------------------ */
  const mobileView = (
    <div className="p-4 space-y-4">
      {filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div>
                <div className="font-bold text-gray-800">Order #{order.id}</div>
                <div
                  className={`text-sm font-semibold mt-1 ${
                    order.status === "delivered"
                      ? "text-green-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : order.status === "processing" || order.status === "shipped"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  Delivery status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              <div className="text-gray-500">
                {expandedOrder === order.id ? <span>▲</span> : <span>▼</span>}
              </div>
            </div>

            {/* Expanded content */}
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-black mb-1">Product : {order.product?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Created : {new Date(order.created_at).toLocaleString()}</div>
                    
                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Option : {order.selected_option_label}</div>
                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Quantity : {order.quantity}</div>
                    
                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Total : Ksh {order.total_price}</div>
                  
                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Payment Method : {order.payment_method}</div>

                  </div>
                  <div>
                    {order.payment_method === 'M-PESA' ? (<div className="text-xs text-black mb-1">Payment Status : {order.payment_status}</div>) : (<div className="text-xs text-black mb-1">Payment Status :  On delivery</div>) }

                  </div>
                  <div>
                    <div className="text-xs text-black mb-1">Phone : {order.customer_phone}</div>

                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="w-full p-2 border rounded text-sm"
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
                  <div className="text-xs text-gray-500 mb-1">
                    Delivery Information
                  </div>
                  {editingDelivery === order.id ? (
                    <div className="space-y-2">
                      <textarea
                        placeholder="Delivery Address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        rows="3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeliverySubmit(order.id)}
                          className="bg-blue-500 text-white px-3 py-2 rounded text-sm flex-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleDeliveryCancel}
                          className="bg-gray-500 text-white px-3 py-2 rounded text-sm flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {order.notes ? (
                        <div className="p-2 bg-white border rounded text-sm">
                          {order.notes}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-sm">
                          Not set
                        </span>
                      )}
                      <button
                        onClick={() => handleDeliveryEdit(order)}
                        className="mt-2 bg-green-500 text-white px-3 py-2 rounded text-sm w-full"
                      >
                        Update Delivery Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">No orders found matching your search.</div>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {searchBar}
      {isDesktop ? desktopView : mobileView}
    </div>
  );
};

export default OrderList;