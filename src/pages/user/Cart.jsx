import React, { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from "../../context/AuthProvider";
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, ShieldCheck, Truck, ArrowRight, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import AddToCart from '../../components/AddToCart';
import DeleteFromCart from '../../components/DeleteFromCart';

const quantityOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Cart() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const ref = useRef(null);

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addToCartQuantity, setAddToCartQuantity] = useState(1);

  async function getCart() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to fetch cart");
        return;
      }

      if (data.cart) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleChangeCartItems = async (product, quantity) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const index = newCart.products.findIndex((p) => p.productId._id === product._id);
      const discount = product.discount || 0;
      const effectivePrice = discount > 0 ? Math.round(product.price - (product.price * discount / 100)) : product.price;
      newCart.products[index].quantity = quantity;
      newCart.products[index].price = effectivePrice * quantity;
      newCart.totalAmount = newCart.products.reduce((acc, p) => acc + p.price, 0);
      newCart.totalItems = newCart.products.length;
      return newCart;
    });
    ref.current.click();
  };

  const handleDeleteCartItems = async (productId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      const index = newCart.products.findIndex((p) => p.productId._id === productId);
      newCart.products.splice(index, 1);
      newCart.totalAmount = newCart.products.reduce((acc, p) => acc + p.price, 0);
      newCart.totalItems = newCart.products.length;
      return newCart;
    });
  }

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      getCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className='md:mt-16 mt-32 min-h-screen bg-gray-50/50'>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-store-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-store-primary/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-store-primary font-medium">Shopping Cart</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-store-gradient flex items-center justify-center shadow-lg shadow-store-primary">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Shopping Cart</h1>
              <p className="text-gray-400 mt-1">
                {loading
                  ? "Loading..."
                  : cart?.products?.length > 0
                    ? `${cart.products.length} item${cart.products.length !== 1 ? 's' : ''} in your cart`
                    : "Your cart is empty"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-store-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Cart with items */}
        {!loading && cart?.products?.length > 0 && (
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Left - Cart Items */}
            <div className='flex-1'>
              <div className='flex flex-col gap-4'>
                {cart.products.map((item, i) => (
                  <div key={item._id} className={`rounded-2xl border border-gray-100 p-5 flex flex-row w-full justify-between bg-white shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-${(i % 4) * 100}`}>
                    <div className='flex flex-1 gap-5'>
                      <div className="relative group">
                        <img
                          className="h-32 w-28 object-cover object-center rounded-xl cursor-pointer group-hover:opacity-80 transition-opacity"
                          width={100} height={100}
                          src={item?.productId?.image}
                          alt={item?.productId?.name || "product"}
                          onClick={() => navigate(`/product/${item?.productId?._id}`)}
                        />
                      </div>
                      <div className='flex flex-col justify-between py-1'>
                        <div>
                          <h3
                            className='text-base font-semibold capitalize cursor-pointer hover:text-store-primary-dark transition-colors leading-tight'
                            onClick={() => navigate(`/product/${item?.productId?._id}`)}
                          >
                            {item.productId?.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 capitalize">{item.productId?.category?.name || ""}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-gray-900'>₹{item.price?.toLocaleString()}</span>
                          {item.productId?.discount > 0 && (
                            <span className='text-xs text-gray-400 line-through'>₹{(item.productId.price * item.quantity)?.toLocaleString()}</span>
                          )}
                          {item.productId?.discount > 0 && (
                            <span className='text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded'>{item.productId.discount}% OFF</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col items-end justify-between'>
                      <DeleteFromCart
                        productId={item.productId}
                        handleDeleteCartItems={handleDeleteCartItems}
                      />
                      <Dialog>
                        <DialogTrigger>
                          <button
                            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-store-primary hover:text-store-primary-dark transition-all"
                            onClick={() => setAddToCartQuantity(item.quantity)}
                          >
                            Qty: {item.quantity}
                            <ChevronDown className='h-3 w-3' />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[320px] rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold">Select Quantity</DialogTitle>
                          </DialogHeader>
                          <DialogDescription>
                            Choose the desired quantity
                          </DialogDescription>
                          <div className='flex flex-col gap-5'>
                            <div className='flex justify-center items-center flex-row flex-wrap gap-2'>
                              {quantityOptions.map((q) => (
                                <button
                                  key={q}
                                  onClick={() => setAddToCartQuantity(q)}
                                  className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all duration-200 ${addToCartQuantity === q
                                    ? 'bg-store-primary text-white border-store-primary shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-store-primary'
                                    }`}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>

                            <AddToCart
                              product={item.productId}
                              quantity={addToCartQuantity}
                              ATC={false}
                              handleChangeCartItems={handleChangeCartItems}
                            >
                              <button className="w-full py-3 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-store-primary">
                                Confirm: {addToCartQuantity}
                              </button>
                            </AddToCart>
                          </div>
                          <DialogClose asChild className="hidden">
                            <Button type="button" variant="secondary" ref={ref}>
                              Close
                            </Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className='lg:w-96'>
              <div className='rounded-2xl border border-gray-100 p-6 bg-white shadow-sm sticky top-28'>
                <h2 className='text-lg font-bold text-gray-900 mb-5'>Order Summary</h2>

                <div className='space-y-3'>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})</span>
                    <div className="flex items-center font-medium">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span>{cart.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 my-3" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      <span>{cart.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-6 py-4 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-store-primary hover:shadow-store-primary-lg flex items-center justify-center gap-2 text-base"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Trust badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: ShieldCheck, text: "Secure Payment", color: "text-green-500" },
                    { icon: Truck, text: "Free Delivery", color: "text-store-primary" },
                    { icon: RotateCcw, text: "Easy Returns", color: "text-blue-500" },
                    { icon: ShoppingCart, text: "Best Prices", color: "text-purple-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!cart?.products || cart.products.length === 0) && (
          <div className='flex flex-col items-center justify-center py-20'>
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm text-center">Looks like you haven't added anything to your cart yet. Explore our products and find something you love.</p>
            <button
              className="inline-flex items-center gap-2 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-store-primary hover:shadow-store-primary-lg hover:scale-105"
              onClick={() => navigate('/products')}
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart