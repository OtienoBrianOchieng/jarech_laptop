import React, { useState, useEffect } from "react";
import { deleteProduct, updateProductCount } from "../../api/products";

const ProductList = ({ products, onEdit, onDelete, onRestock }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [restockQuantities, setRestockQuantities] = useState({});
  const [isRestocking, setIsRestocking] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        onDelete(id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleRestockChange = (id, value) => {
    setRestockQuantities({
      ...restockQuantities,
      [id]: parseInt(value) || 0
    });
  };

  const submitRestock = async (id) => {
    const quantity = restockQuantities[id] || 0;
    
    if (quantity <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    setIsRestocking({ ...isRestocking, [id]: true });
    
    try {
      const updatedProduct = await updateProductCount(id, quantity);
      onRestock(updatedProduct);
      
      // Clear the input field
      setRestockQuantities({
        ...restockQuantities,
        [id]: 0
      });
    } catch (error) {
      console.error("Restock failed:", error);
      alert("Failed to restock product");
    } finally {
      setIsRestocking({ ...isRestocking, [id]: false });
    }
  };

  const renderOptionValue = (value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

  /** Desktop View */
  const desktopView = (
    <div className="overflow-x-auto rounded-xl shadow-lg">
      <table className="min-w-full bg-white border-separate border-spacing-0">
        <thead>
          <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm uppercase tracking-wide">
            <th className="py-4 px-6 text-left first:rounded-tl-xl">Name</th>
            <th className="py-4 px-6 text-left">Description</th>
            <th className="py-4 px-6 text-left">Heat Level</th>
            <th className="py-4 px-6 text-left">Count</th>
            <th className="py-4 px-6 text-left">Restock</th>
            <th className="py-4 px-6 text-left">Options</th>
            <th className="py-4 px-6 text-center last:rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-100`}
            >
              <td className="py-3 px-6 border-b border-orange-200 font-medium text-orange-900">{product.name}</td>
              <td className="py-3 px-6 border-b border-orange-200 max-w-xs truncate">{product.description}</td>
              <td className="py-3 px-6 border-b border-orange-200">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {product.heat_level}
                </span>
              </td>
              <td className="py-3 px-6 border-b border-orange-200 font-medium text-orange-900">{product.count}</td>
              <td className="py-3 px-6 border-b border-orange-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={restockQuantities[product.id] || ""}
                    onChange={(e) => handleRestockChange(product.id, e.target.value)}
                    className="w-16 px-2 py-1 border border-orange-300 rounded-md text-sm"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => submitRestock(product.id)}
                    disabled={isRestocking[product.id]}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300"
                  >
                    {isRestocking[product.id] ? "..." : "Add"}
                  </button>
                </div>
              </td>
              <td className="py-3 px-6 border-b border-orange-200">
                {product.options &&
                  Object.entries(product.options).map(([key, value]) => (
                    <div key={key} className="text-gray-600 text-xs">
                      <span className="font-medium text-orange-700">{key}:</span>{" "}
                      {renderOptionValue(value)}
                    </div>
                  ))}
              </td>
              <td className="py-3 px-6 border-b border-orange-200 text-center space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-orange-600 text-white px-4 py-1.5 rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /** Mobile View */
  const mobileView = (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-orange-200 rounded-xl shadow-sm p-5 bg-white space-y-3 transition-all duration-150 hover:shadow-md"
        >
          <div>
            <p className="text-orange-900 font-bold text-lg">{product.name}</p>
            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-700 text-sm mr-2">Heat Level:</strong>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {product.heat_level}
            </span>
          </div>
          <div className="flex items-center">
            <strong className="text-gray-700 text-sm mr-2">Count:</strong>
            <span className="font-medium text-orange-900">{product.count}</span>
          </div>
          <div className="flex items-center space-x-2">
            <strong className="text-gray-700 text-sm">Restock:</strong>
            <input
              type="number"
              min="1"
              value={restockQuantities[product.id] || ""}
              onChange={(e) => handleRestockChange(product.id, e.target.value)}
              className="w-16 px-2 py-1 border border-orange-300 rounded-md text-sm"
              placeholder="Qty"
            />
            <button
              onClick={() => submitRestock(product.id)}
              disabled={isRestocking[product.id]}
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300"
            >
              {isRestocking[product.id] ? "..." : "Add"}
            </button>
          </div>
          {product.options && (
            <div>
              <strong className="text-gray-700 text-sm">Options:</strong>
              <ul className="mt-1 space-y-1 text-sm text-gray-600">
                {Object.entries(product.options).map(([key, value]) => (
                  <li key={key} className="flex">
                    <span className="font-medium text-orange-700 mr-1">{key}:</span>
                    <span className="truncate">{renderOptionValue(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => onEdit(product)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md flex-1 sm:flex-none"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm hover:shadow-md flex-1 sm:flex-none"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-green-50 min-h-screen">
      {isDesktop ? desktopView : mobileView}
    </div>
  );
};

export default ProductList;