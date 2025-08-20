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
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {product ? "Edit Product" : "Add Product"}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border rounded-lg p-4 shadow bg-white"
        >
          {error && <div className="text-red-500">{error}</div>}

          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Heat Level</label>
            <input
              type="number"
              name="heat_level"
              value={formData.heat_level}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="10"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Options</label>
            <div className="space-y-2">
              {formData.options.map((opt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border p-2 rounded"
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-600">
                      Value: {opt.value} | Price: Ksh {opt.price}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Add new option */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="label"
                  placeholder="Option label"
                  value={newOption.label}
                  onChange={handleNewOptionChange}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="value"
                  placeholder="Option value"
                  value={newOption.value}
                  onChange={handleNewOptionChange}
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newOption.price}
                  onChange={handleNewOptionChange}
                  className="p-2 border rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 mt-2"
              >
                Add Option
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Add Product"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                onCancel?.();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
