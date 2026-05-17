import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, Gift, Package, X } from "lucide-react";

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [mainProduct, setMainProduct] = useState(null); // { id, name, price }
  const [additionalProducts, setAdditionalProducts] = useState([]); // [{ id, name, price }]

  // Product Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTarget, setSearchTarget] = useState("main"); // 'main' or 'additional'

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, []);

  async function fetchBundles() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/bundle/admin`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setBundles(data.bundles || []);
    } catch {
      toast.error("Error fetching bundles");
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

  const openModal = (bundle = null) => {
    if (bundle) {
      setEditing(bundle);
      setName(bundle.name);
      setIsActive(bundle.isActive);
      setDiscountPercentage(bundle.discountPercentage);
      setMainProduct({
        id: bundle.mainProduct._id,
        name: bundle.mainProduct.name,
        price: bundle.mainProduct.price,
      });
      setAdditionalProducts(
        bundle.additionalProducts.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
        }))
      );
    } else {
      setEditing(null);
      setName("");
      setIsActive(true);
      setDiscountPercentage(10);
      setMainProduct(null);
      setAdditionalProducts([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  const activeFilteredProducts = products.filter((p) => {
    if (!p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (searchTarget === "main") return true;
    
    // For additional products, exclude the main product and already selected additional products
    if (mainProduct && mainProduct.id === p._id) return false;
    if (additionalProducts.find((ap) => ap.id === p._id)) return false;
    return true;
  });

  const addProductToBundle = (p) => {
    if (searchTarget === "main") {
      setMainProduct({ id: p._id, name: p.name, price: p.price });
      // If the new main product is in additional, remove it from there
      setAdditionalProducts(additionalProducts.filter(ap => ap.id !== p._id));
    } else {
      setAdditionalProducts([
        ...additionalProducts,
        { id: p._id, name: p.name, price: p.price },
      ]);
    }
    setSearchTerm("");
  };

  const removeAdditionalProduct = (id) => {
    setAdditionalProducts(additionalProducts.filter((p) => p.id !== id));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mainProduct) return toast.error("A main product is required");
    if (additionalProducts.length === 0) return toast.error("At least one additional product is required");

    const payload = {
      name,
      isActive,
      discountPercentage: Number(discountPercentage),
      mainProduct: mainProduct.id,
      additionalProducts: additionalProducts.map((p) => p.id),
    };

    try {
      const url = editing
        ? `${process.env.REACT_APP_API_URL}/bundle/admin/${editing._id}`
        : `${process.env.REACT_APP_API_URL}/bundle/admin`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? "Bundle updated" : "Bundle created");
        closeModal();
        fetchBundles();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch {
      toast.error("Failed to save bundle");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this Bundle?")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/bundle/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Bundle deleted");
        fetchBundles();
      }
    } catch {
      toast.error("Failed to delete bundle");
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="h-6 w-6 text-store-primary" />
            Bundle Offers
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create "Frequently Bought Together" deals to increase average order value.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-store-primary text-white px-4 py-2 rounded-xl hover:bg-store-primary-dark transition-colors font-semibold"
        >
          <Plus size={20} />
          Create Bundle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-store-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {bundles.map((bundle) => {
            return (
              <div
                key={bundle._id}
                className={`bg-white rounded-2xl border ${
                  bundle.isActive ? "border-emerald-200 shadow-md" : "border-gray-200"
                } p-6 relative flex flex-col`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{bundle.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          bundle.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {bundle.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs bg-store-primary/10 text-store-primary px-2 py-0.5 rounded-full font-bold">
                        {bundle.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(bundle)}
                      className="p-1.5 text-gray-400 hover:text-store-primary hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(bundle._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex bg-gray-50 rounded-xl p-4 gap-4 items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center p-1 shadow-sm mb-2 border border-gray-100">
                      {bundle.mainProduct?.image ? (
                        <img src={bundle.mainProduct.image} className="w-full h-full object-contain" alt="" />
                      ) : <Package className="h-6 w-6 text-gray-300" />}
                    </div>
                    <span className="text-[10px] font-semibold text-center text-gray-700 uppercase tracking-wide">Main Item</span>
                    <span className="text-xs text-gray-500 text-center line-clamp-1 mt-1">{bundle.mainProduct?.name}</span>
                  </div>

                  <div className="text-xl font-bold text-gray-300">+</div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="flex gap-2 mb-2">
                       {bundle.additionalProducts?.map(ap => (
                          <div key={ap._id} className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center p-1 shadow-sm border border-gray-100">
                             {ap.image ? (
                                <img src={ap.image} className="w-full h-full object-contain" alt="" />
                             ) : <Package className="h-5 w-5 text-gray-300" />}
                          </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-semibold text-center text-gray-700 uppercase tracking-wide">Together With</span>
                    <span className="text-xs text-gray-500 text-center line-clamp-1 mt-1">{bundle.additionalProducts?.length} Items</span>
                  </div>
                </div>
              </div>
            );
          })}
          {bundles.length === 0 && (
            <div className="col-span-1 xl:col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl">
              <Gift className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-500 mb-1">No Bundles Configured</h3>
              <p className="text-sm text-gray-400 mb-4">Create a Frequently Bought Together bundle to boost sales.</p>
              <button onClick={() => openModal()} className="bg-store-primary text-white px-5 py-2 rounded-xl font-semibold">Create Bundle</button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Gift className="h-5 w-5 text-store-primary" />
                {editing ? "Edit Bundle" : "Create Bundle"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="bundleForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bundle Name</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl p-3 focus:ring-store-primary focus:border-store-primary bg-gray-50"
                      placeholder="e.g. The Ultimate Starter Kit"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full border rounded-xl p-3 focus:ring-store-primary focus:border-store-primary bg-gray-50 font-bold text-store-primary"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Discount applied to these items when bought together.</p>
                  </div>
                  <div className="flex items-center gap-3 md:mt-6 bg-emerald-50 rounded-xl px-4 py-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                    />
                    <div>
                      <label htmlFor="isActive" className="text-sm font-bold text-emerald-800">
                        Bundle is Active
                      </label>
                      <p className="text-[10px] text-emerald-600">Customers can see and purchase this deal.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100 my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* MAIN PRODUCT */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-900">Main Product</h3>
                      {mainProduct && (
                         <button type="button" onClick={() => setMainProduct(null)} className="text-[10px] uppercase font-bold text-gray-400 hover:text-red-500">Clear</button>
                      )}
                    </div>
                    
                    {!mainProduct ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search for main product..."
                          className="w-full pl-9 pr-4 py-2 border rounded-xl focus:ring-store-primary focus:border-store-primary shadow-sm"
                          value={searchTarget === "main" ? searchTerm : ""}
                          onChange={(e) => {
                            setSearchTarget("main");
                            setSearchTerm(e.target.value);
                          }}
                          onFocus={() => setSearchTarget("main")}
                        />
                        {searchTarget === "main" && searchTerm && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                            {activeFilteredProducts.map((p) => (
                              <div
                                key={p._id}
                                onClick={() => addProductToBundle(p)}
                                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                              >
                                <span className="text-sm font-medium text-gray-900">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-store-primary-light border border-store-primary/20 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                         <div>
                            <span className="text-[10px] text-store-primary uppercase font-bold tracking-wider">Base Item</span>
                            <p className="font-bold text-gray-900">{mainProduct.name}</p>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* ADDITIONAL PRODUCTS */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-right">Items Bought Together</h3>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search to add accessory..."
                        className="w-full pl-9 pr-4 py-2 border rounded-xl focus:ring-store-primary focus:border-store-primary shadow-sm"
                        value={searchTarget === "additional" ? searchTerm : ""}
                        onChange={(e) => {
                          setSearchTarget("additional");
                          setSearchTerm(e.target.value);
                        }}
                        onFocus={() => setSearchTarget("additional")}
                      />
                      {searchTarget === "additional" && searchTerm && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {activeFilteredProducts.map((p) => (
                            <div
                              key={p._id}
                              onClick={() => addProductToBundle(p)}
                              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
                            >
                              <span className="text-sm font-medium text-gray-900">{p.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                       {additionalProducts.length === 0 ? (
                          <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                             No accessories added yet.
                          </div>
                       ) : (
                          additionalProducts.map(ap => (
                             <div key={ap.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-3 animate-fade-in-up">
                                <span className="text-sm font-medium text-gray-700 clamp-1">{ap.name}</span>
                                <button type="button" onClick={() => removeAdditionalProduct(ap.id)} className="text-gray-400 hover:text-red-500">
                                   <X className="h-4 w-4" />
                                </button>
                             </div>
                          ))
                       )}
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bundleForm"
                className="px-5 py-2.5 bg-store-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {editing ? "Save Changes" : "Create Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
