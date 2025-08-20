import React, { useState, useEffect } from "react";
import { deleteProduct } from "../../api/products";

const ProductList = ({ products, onEdit, onDelete }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024); // adjust breakpoint if needed
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

  const renderOptionValue = (value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

  /** Desktop View */
  const desktopView = (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
            <th className="py-3 px-4 border-b text-left">Name</th>
            <th className="py-3 px-4 border-b text-left">Description</th>
            <th className="py-3 px-4 border-b text-left">Heat Level</th>
            <th className="py-3 px-4 border-b text-left">Options</th>
            <th className="py-3 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-3 px-4 border-b">{product.name}</td>
              <td className="py-3 px-4 border-b">{product.description}</td>
              <td className="py-3 px-4 border-b">{product.heat_level}</td>
              <td className="py-3 px-4 border-b">
                {product.options &&
                  Object.entries(product.options).map(([key, value]) => (
                    <div key={key} className="text-gray-600">
                      <span className="font-medium">{key}:</span>{" "}
                      {renderOptionValue(value)}
                    </div>
                  ))}
              </td>
              <td className="py-3 px-4 border-b text-center space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors duration-200"
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
          className="border border-gray-200 rounded-xl shadow-sm p-4 bg-white space-y-3"
        >
          <div>
            <p className="text-gray-900 font-semibold text-lg">{product.name}</p>
            <p className="text-gray-600 text-sm">{product.description}</p>
          </div>
          <p className="text-sm">
            <strong className="text-gray-700">Heat Level:</strong>{" "}
            {product.heat_level}
          </p>
          {product.options && (
            <div>
              <strong className="text-gray-700">Options:</strong>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {Object.entries(product.options).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-medium">{key}:</span>{" "}
                    {renderOptionValue(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => onEdit(product)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 w-full sm:w-auto"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 w-full sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {isDesktop ? desktopView : mobileView}
    </div>
  );
};

export default ProductList;
