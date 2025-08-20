import { useState, useEffect } from "react";
import { updateOrderStatus, updateDeliveryInfo } from "../../api/orders";

const OrderList = ({ orders, onStatusUpdate, onDeliveryUpdate }) => {
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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

  /** ------------------ DESKTOP VIEW ------------------ */
  const desktopView = (
    <div className="p-4 overflow-x-auto">
      <table className="w-full min-w-max bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Order ID",
              "Product",
              "Option",
              "Qty",
              "Total",
              "Phone",
              "Status",
              "Delivery",
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
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">#{order.id}</td>
              <td className="py-3 px-4 text-sm">{order.product?.name}</td>
              <td className="py-3 px-4 text-sm">
                {order.selected_option_label}
              </td>
              <td className="py-3 px-4 text-sm">{order.quantity}</td>
              <td className="py-3 px-4 text-sm">Ksh {order.total_price}</td>
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
                    Update Delivery
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /** ------------------ MOBILE/TABLET VIEW ------------------ */
  const mobileView = (
    <div className="p-4 space-y-4">
      {orders.map((order) => (
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
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                  <div className="text-xs text-gray-500 mb-1">Product</div>
                  <div className="font-medium">{order.product?.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Option</div>
                  <div className="font-medium">
                    {order.selected_option_label}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Quantity</div>
                  <div className="font-medium">{order.quantity}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total</div>
                  <div className="font-medium">Ksh {order.total_price}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Phone</div>
                  <div className="font-medium">{order.customer_phone}</div>
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
      ))}
    </div>
  );

  return isDesktop ? desktopView : mobileView;
};

export default OrderList;
