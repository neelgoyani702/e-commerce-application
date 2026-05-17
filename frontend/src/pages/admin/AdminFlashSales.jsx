import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Zap } from "lucide-react";

export default function AdminFlashSales() {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]); // [{ product: id, salePrice: num, name: string }]

  // Product Search State
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  async function fetchFlashSales() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/flash-sales`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setFlashSales(data.flashSales);
    } catch {
      toast.error("Error fetching flash sales");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/product/get-products?limit=1000`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.products) setProducts(data.products);
    } catch {
      console.error("Error fetching products");
    }
  }

  const openModal = (sale = null) => {
    if (sale) {
      setEditing(sale);
      setName(sale.name);
      setStartDate(new Date(sale.startDate).toISOString().slice(0, 16));
      setEndDate(new Date(sale.endDate).toISOString().slice(0, 16));
      setIsActive(sale.isActive);
      setSelectedProducts(
        sale.products.map((p) => ({
          product: p.product._id,
          name: p.product.name,
          salePrice: p.salePrice,
          originalPrice: p.product.price,
        }))
      );
    } else {
      setEditing(null);
      setName("");
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartDate(now.toISOString().slice(0, 16));
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEndDate(tomorrow.toISOString().slice(0, 16));
      
      setIsActive(true);
      setSelectedProducts([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  const activeFilteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedProducts.find((sp) => sp.product === p._id)
  );

  const addProductToSale = (p) => {
    setSelectedProducts([
      ...selectedProducts,
      { product: p._id, name: p.name, salePrice: p.price, originalPrice: p.price },
    ]);
    setSearchTerm("");
  };

  const removeProductFromSale = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product !== productId));
  };

  const updateSalePrice = (productId, price) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.product === productId ? { ...p, salePrice: Number(price) } : p
      )
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      return toast.error("Please add at least one product");
    }

    const payload = {
      name,
      startDate,
      endDate,
      isActive,
      products: selectedProducts.map((p) => ({
        product: p.product,
        salePrice: p.salePrice,
      })),
    };

    try {
      const url = editing
        ? `${process.env.REACT_APP_API_URL}/flash-sales/${editing._id}`
        : `${process.env.REACT_APP_API_URL}/flash-sales`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? "Flash Sale updated" : "Flash Sale created");
        closeModal();
        fetchFlashSales();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch {
      toast.error("Failed to save flash sale");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this Flash Sale?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/flash-sales/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Flash Sale deleted");
        fetchFlashSales();
      }
    } catch {
      toast.error("Failed to delete flash sale");
    }
  }

  // Check if active based on time
  const isCurrentlyActive = (sale) => {
    const now = new Date();
    return sale.isActive && now >= new Date(sale.startDate) && now <= new Date(sale.endDate);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-store-primary" />
            Flash Sales
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage time-limited deals and product offers.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-store-primary text-white px-4 py-2 rounded-xl hover:bg-store-primary-dark transition-colors font-semibold"
        >
          <Plus size={20} />
          Create Sale
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-store-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {flashSales.map((sale) => {
            const active = isCurrentlyActive(sale);
            return (
              <div
                key={sale._id}
                className={`bg-white rounded-2xl border ${
                  active ? "border-emerald-200 shadow-md" : "border-gray-200"
                } p-6 relative flex flex-col`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{sale.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          active
                            ? "bg-emerald-100 text-emerald-700"
                            : sale.isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {active ? "Currently Active" : sale.isActive ? "Scheduled" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(sale)}
                      className="p-1.5 text-gray-400 hover:text-store-primary hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(sale._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Starts:</span>
                    <span className="font-medium">{new Date(sale.startDate).toLocaleString()}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Ends:</span>
                    <span className="font-medium">{new Date(sale.endDate).toLocaleString()}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Products:</span>
                    <span className="font-medium">{sale.products.length} items</span>
                  </div>
                </div>

                <div className="mt-auto border-t pt-4">
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {sale.products.map((p) => p.product?.name).join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-store-primary" />
                {editing ? "Edit Flash Sale" : "Create Flash Sale"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="flashSaleForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sale Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 focus:ring-store-primary focus:border-store-primary"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg p-2.5 focus:ring-store-primary focus:border-store-primary"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-lg p-2.5 focus:ring-store-primary focus:border-store-primary"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-store-primary focus:ring-store-primary border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Sale is Enabled
                    </label>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Add Products to Sale</h3>
                  
                  {/* Search Product Box */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search to add product..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-store-primary focus:border-store-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {activeFilteredProducts.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">No products found.</div>
                        ) : (
                          activeFilteredProducts.map((p) => (
                            <div
                              key={p._id}
                              onClick={() => addProductToSale(p)}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                            >
                              <span className="text-sm font-medium text-gray-900">{p.name}</span>
                              <span className="text-sm text-gray-500">₹{p.price}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Products Table */}
                  {selectedProducts.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price (₹)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedProducts.map((sp) => (
                            <tr key={sp.product}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 line-clamp-1">{sp.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">₹{sp.originalPrice || "N/A"}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-24 border rounded px-2 py-1 text-sm focus:ring-store-primary focus:border-store-primary"
                                  value={sp.salePrice}
                                  onChange={(e) => updateSalePrice(sp.product, e.target.value)}
                                  required
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeProductFromSale(sp.product)}
                                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="flashSaleForm"
                className="px-5 py-2 bg-store-primary text-white font-semibold rounded-xl hover:bg-store-primary-dark transition-colors"
              >
                {editing ? "Save Changes" : "Create Deal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
