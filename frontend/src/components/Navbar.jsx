import { cn } from "../lib/utils";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { XIcon, Menu, ShoppingCart, Search, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthProvider";
import { SettingsContext } from "../context/SettingsProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";
import { toast } from "sonner";

const navigation = [
  { name: "Products", to: "/products" },
  { name: "Category", to: "/category" },
  { name: "Orders", to: "/profile/orders" },
  { name: "Contact Us", to: "/contact" },
];

export default function Navbar() {
  const [path] = useState(window.location.pathname);

  const { user, setUser } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);

  const [isOpen, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (isOpen) toggleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Update document title with store name
  useEffect(() => {
    if (settings?.storeName) {
      document.title = settings.storeName;
    }
  }, [settings?.storeName]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
        setSearchQuery("");
        setSearchResults({ products: [], categories: [] });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeOnCurrent = (to) => {
    if (path === to) {
      toggleOpen();
    }
  };

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setSearchResults({ products: [], categories: [] });
      setShowSearch(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/product/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults({
          products: data.products || [],
          categories: data.categories || [],
        });
        setShowSearch(true);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults({ products: [], categories: [] });
      setShowSearch(false);
      return;
    }
    setSearching(true);
    setShowSearch(true);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
      setMobileSearchOpen(false);
    }
    if (e.key === "Escape") {
      setShowSearch(false);
      setMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearch(false);
    setMobileSearchOpen(false);
    setSearchResults({ products: [], categories: [] });
  };

  const currencySymbol = settings?.currencySymbol || "₹";
  const hasResults = searchResults.products.length > 0 || searchResults.categories.length > 0;

  const logout = async () => {
    try {
      const toastId = toast.loading("Logging out...");

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      toast.dismiss(toastId);
      const data = await response.json();

      if (response.ok) {
        setUser(null);
        navigate("/");
        toast.success(data.message || "Logged out successfully");
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (e) {
      toast.error(e.message || "Something went wrong");
      console.log("Error: in logout action", e);
    }
  };

  // Search Results Dropdown Component
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
      {searching && !hasResults ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 border-2 border-gray-300 border-t-store-primary rounded-full animate-spin"></div>
        </div>
      ) : !hasResults && searchQuery.trim() ? (
        <div className="py-8 text-center">
          <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No results for "{searchQuery}"</p>
          <p className="text-xs text-gray-300 mt-1">Try a different search term</p>
        </div>
      ) : (
        <>
          {/* Categories */}
          {searchResults.categories.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Categories</p>
              <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                {searchResults.categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleResultClick(`/category/${cat._id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 hover:bg-store-primary-light hover:text-store-primary transition-colors capitalize"
                  >
                    {cat.name}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {searchResults.products.length > 0 && (
            <div className="px-3 pb-2">
              {searchResults.categories.length > 0 && <div className="border-t border-gray-50 mb-2" />}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Products</p>
              <div className="space-y-0.5">
                {searchResults.products.map((product) => {
                  const hasDiscount = product.discount > 0;
                  const discountedPrice = hasDiscount
                    ? Math.round(product.price - (product.price * product.discount / 100))
                    : product.price;
                  return (
                    <button
                      key={product._id}
                      onClick={() => handleResultClick(`/product/${product._id}`)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate capitalize group-hover:text-store-primary transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">
                            {currencySymbol}{discountedPrice.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-[10px] text-gray-400 line-through">
                                {currencySymbol}{product.price.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                {product.discount}% off
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {product.stock === 0 && (
                        <span className="text-[10px] font-semibold text-red-500 flex-shrink-0">Out of stock</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View all results */}
          {hasResults && (
            <button
              onClick={() => {
                navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery("");
                setShowSearch(false);
              }}
              className="w-full px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 hover:text-store-primary hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border-t border-gray-100"
            >
              View all results for "{searchQuery}"
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </>
      )}
    </div>
  );

  return (
    <nav className="bg-white/90 backdrop-blur-md fixed z-50 w-full top-0 shadow">
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-20 justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              <Button
                onClick={() => toggleOpen()}
                variant={"link"}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-between sm:items-stretch sm:justify-start ml-12">
              <Link to="/" className="flex flex-shrink-0 items-center gap-2">
                <img
                  className="block h-12 w-12 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?q=80&w=1916&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt={settings?.storeName || "Logo"}
                  width={300}
                  height={300}
                />
                <span className="hidden sm:block text-lg font-bold text-gray-900 tracking-tight">
                  {settings?.storeName || "ShopKart"}
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 w-full justify-center">
                {navigation.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => closeOnCurrent(item.to)}
                    className="group my-auto inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 "
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="flex justify-center items-center space-x-4">
                {/* Desktop Search */}
                <div className="hidden md:block relative" ref={searchRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => { if (searchQuery.trim() && hasResults) setShowSearch(true); }}
                      className="w-56 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary focus:bg-white transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(""); setShowSearch(false); setSearchResults({ products: [], categories: [] }); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {showSearch && <SearchDropdown />}
                </div>

                {/* Mobile Search Icon */}
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-900"
                >
                  <Search className="h-5 w-5" />
                </button>

                <Link to="/checkout/cart">
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="outline-none"
                    >
                      <div className="rounded-full border border-slate-300 flex justify-center items-center">
                        <Avatar>
                          <AvatarImage src={user.image} alt="user" className="rounded-full cursor-pointer" />
                          <AvatarFallback>{user.firstName[0] + user.lastName[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>
                        {user.firstName} {user.lastName}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 focus:text-gray-900">
                        <Link to="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-gray-100 focus:text-gray-900">Subscription</DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-slate-200' />
                      <DropdownMenuItem
                        className="font-semibold cursor-pointer focus:bg-gray-100 focus:text-gray-900"
                        onClick={() => {
                          logout();
                        }}
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="outline">
                    <Link to="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"></div>
          </div>
        </div>

        {isOpen ? (
          <div className="sm:hidden">
            <div className="space-y-1 pt-2 pb-4">
              {navigation.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    item.to === path
                      ? "bg-indigo-50 border-primary text-primary"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700",
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}>
          <div
            ref={mobileSearchRef}
            className="bg-white px-4 pt-4 pb-2 shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary focus:bg-white transition-all"
              />
              <button
                onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); setSearchResults({ products: [], categories: [] }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            {showSearch && (
              <div className="mt-2 max-h-[60vh] overflow-y-auto">
                {searching && !hasResults ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 border-2 border-gray-300 border-t-store-primary rounded-full animate-spin"></div>
                  </div>
                ) : !hasResults && searchQuery.trim() ? (
                  <div className="py-8 text-center">
                    <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No results for "{searchQuery}"</p>
                  </div>
                ) : (
                  <>
                    {searchResults.categories.length > 0 && (
                      <div className="pb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Categories</p>
                        <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                          {searchResults.categories.map((cat) => (
                            <button
                              key={cat._id}
                              onClick={() => handleResultClick(`/category/${cat._id}`)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 hover:bg-store-primary-light hover:text-store-primary transition-colors capitalize"
                            >
                              {cat.name}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {searchResults.products.length > 0 && (
                      <div className="pb-2">
                        {searchResults.categories.length > 0 && <div className="border-t border-gray-100 mb-2" />}
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Products</p>
                        <div className="space-y-0.5">
                          {searchResults.products.map((product) => {
                            const hasDiscount = product.discount > 0;
                            const discountedPrice = hasDiscount
                              ? Math.round(product.price - (product.price * product.discount / 100))
                              : product.price;
                            return (
                              <button
                                key={product._id}
                                onClick={() => handleResultClick(`/product/${product._id}`)}
                                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate capitalize">{product.name}</p>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-900">
                                      {currencySymbol}{discountedPrice.toLocaleString()}
                                    </span>
                                    {hasDiscount && (
                                      <span className="text-[10px] font-bold text-emerald-600">{product.discount}% off</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {hasResults && (
                      <button
                        onClick={() => {
                          navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchQuery("");
                          setShowSearch(false);
                          setMobileSearchOpen(false);
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 hover:text-store-primary transition-colors flex items-center justify-center gap-1.5 border-t border-gray-100 rounded-b-xl"
                      >
                        View all results
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
