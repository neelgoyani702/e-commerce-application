import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import {
  IndianRupee,
  Package,
  XCircle,
  ShoppingBag,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";

function MyOrders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getOrders() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/order`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder(orderId) {
    try {
      const toastId = toast.loading("Cancelling order...");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/order/${orderId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      toast.dismiss(toastId);
      const data = await response.json();
      if (response.ok) {
        toast.success("Order cancelled successfully");
        setOrders(orders.filter((order) => order._id !== orderId));
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="md:mt-24 mt-36">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-yellow-400">My Orders</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
              <p className="text-gray-400 mt-1">
                {loading
                  ? "Loading..."
                  : `${orders.length} active order${orders.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No active orders
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't placed any orders yet.
            </p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-yellow-600 hover:bg-yellow-500 py-6 px-8 text-base gap-2"
            >
              Browse Products
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium capitalize">
                      {order.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                      onClick={() => cancelOrder(order._id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y">
                  {order.products?.map((item, index) => (
                    <div key={index} className="flex gap-4 py-3">
                      <img
                        className="h-16 w-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        src={item?.productId?.image}
                        alt={item?.productId?.name || "Product"}
                        onClick={() =>
                          navigate(`/product/${item?.productId?._id}`)
                        }
                      />
                      <div className="flex-1">
                        <h3
                          className="font-medium capitalize cursor-pointer hover:text-yellow-700 transition-colors"
                          onClick={() =>
                            navigate(`/product/${item?.productId?._id}`)
                          }
                        >
                          {item.productId?.name || "Product"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span className="font-medium">{item.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="text-sm text-gray-500">
                    {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                  </span>
                  <div className="flex items-center gap-1 font-semibold">
                    <span className="text-gray-500 text-sm mr-2">Total:</span>
                    <IndianRupee className="h-4 w-4" />
                    <span className="text-lg">{order.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
