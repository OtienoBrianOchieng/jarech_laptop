import { useState } from "react";
import { createProduct, updateProduct } from "../../api/products";

const ProductForm = ({ product, onCancel, onProductUpdated, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    heat_level: product?.heat_level || 0,
    image_url: product?.image_url || "",
    options: product?.options || [], // now an array of {label, value, price}
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // temp inputs for new option
  const [newOption, setNewOption] = useState({
    label: "",
    value: "",
    price: "",
  });

  const [showForm, setShowForm] = useState(false); // toggle visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOption({ ...newOption, [name]: value });
  };

  const handleAddOption = () => {
    if (newOption.label && newOption.value && newOption.price) {
      setFormData({
        ...formData,
        options: [...formData.options, { ...newOption, price: Number(newOption.price) }],
      });
      setNewOption({ label: "", value: "", price: "" });
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (product) {
        const updatedProduct = await updateProduct(product.id, formData);
        onProductUpdated(updatedProduct);
      } else {
        const newProduct = await createProduct(formData);
        onProductCreated(newProduct);
        setFormData({
          name: "",
          description: "",
          heat_level: 0,
          image_url: "",
          options: [],
        });
        setShowForm(false); // hide after add
      }
    } catch (err) {
      setError("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {product ? "Edit Product" : "Add New Product"}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border border-orange-200 rounded-xl p-6 shadow-lg bg-gradient-to-br from-white to-orange-50"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-orange-800 font-medium mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-orange-800 font-medium mb-2">Heat Level (0-10)</label>
              <input
                type="number"
                name="heat_level"
                value={formData.heat_level}
                onChange={handleChange}
                className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                min="0"
                max="10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-orange-800 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              rows="3"
              placeholder="Describe the product..."
            />
          </div>

          <div>
            <label className="block text-orange-800 font-medium mb-2">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="border-t border-orange-200 pt-4">
            <label className="block text-orange-800 font-medium mb-3">Product Options</label>
            
            {formData.options.length > 0 && (
              <div className="space-y-3 mb-4">
                {formData.options.map((opt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-orange-900">{opt.label}</div>
                      <div className="text-sm text-orange-700">
                        Value: {opt.value} | Price: Ksh {opt.price}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                      title="Remove option"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new option */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-green-800 font-medium mb-3">Add New Option</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <input
                    type="text"
                    name="label"
                    placeholder="Option label"
                    value={newOption.label}
                    onChange={handleNewOptionChange}
                    className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="value"
                    placeholder="Option value"
                    value={newOption.value}
                    onChange={handleNewOptionChange}
                    className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price (Ksh)"
                    value={newOption.price}
                    onChange={handleNewOptionChange}
                    className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Option
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-orange-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium flex-1 flex items-center justify-center disabled:from-orange-300 disabled:to-orange-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {product ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {product ? "Update Product" : "Add Product"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                onCancel?.();
              }}
              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-medium flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductForm;
