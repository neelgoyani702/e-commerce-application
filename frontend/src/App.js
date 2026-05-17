import "./App.css";
import Signup from "./pages/user/Signup.jsx";
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Toaster } from "./components/ui/sonner"
import Login from "./pages/user/Login.jsx";
import Home from "./pages/user/Home";
import AuthProvider from "./context/AuthProvider";
import Category from "./pages/user/Category";
import Layout from "./Layout.js";
import Profile from "./pages/user/Profile";
import ProfileInfo from "./pages/user/ProfileInfo";
import UserAddress from "./pages/user/UserAddress";
import CategoryProducts from "./pages/user/CategoryProducts";
import ProductDetail from "./pages/user/ProductDetail";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import OrderConfirmation from "./pages/user/OrderConfirmation";
import MyOrders from "./pages/user/MyOrders";
import OrderHistory from "./pages/user/OrderHistory";
import ChangePassword from "./pages/user/ChangePassword";
import AllProducts from "./pages/user/AllProducts";
import Wishlist from "./pages/user/Wishlist";
import NotFound from "./pages/user/NotFound";
import SettingsProvider from "./context/SettingsProvider";
import CompareProvider from "./context/CompareProvider";
import { FlashSaleProvider } from "./context/FlashSaleProvider";
import CompareProducts from "./pages/user/CompareProducts";

// Admin imports
import AdminRoute from "./pages/admin/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminCustomerInsights from "./pages/admin/AdminCustomerInsights";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminFlashSales from "./pages/admin/AdminFlashSales";
import AdminBundles from "./pages/admin/AdminBundles";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminBulk from "./pages/admin/AdminBulk";
import AdminSegments from "./pages/admin/AdminSegments";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "profile",
        element: <Profile />,
        children: [
          {
            path: '',
            element: <ProfileInfo />
          },
          {
            path: 'addresses',
            element: <UserAddress />
          },
          {
            path: 'orders',
            element: <MyOrders />
          },
          {
            path: 'order-history',
            element: <OrderHistory />
          },
          {
            path: 'change-password',
            element: <ChangePassword />
          },
          {
            path: 'wishlist',
            element: <Wishlist />
          }
        ],
      },
      {
        path: "category",
        element: <Category />,
      },
      {
        path: "category/:categoryId/products",
        element: <CategoryProducts />
      },
      {
        path: "product/:productId",
        element: <ProductDetail />
      },
      {
        path: "checkout/cart",
        element: <Cart />
      },
      {
        path: "checkout",
        element: <Checkout />
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />
      },
      {
        path: "compare",
        element: <CompareProducts />
      },
      {
        path: "products",
        element: <AllProducts />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ],
  },
  // Admin routes — completely separate from user Layout
  {
    path: "admin",
    element: <AdminRoute />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "products", element: <AdminProducts /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "users", element: <AdminUsers /> },
      { path: "activity-log", element: <AdminActivityLog /> },
      { path: "customers", element: <AdminCustomerInsights /> },
      { path: "coupons", element: <AdminCoupons /> },
      { path: "returns", element: <AdminReturns /> },
      { path: "flash-sales", element: <AdminFlashSales /> },
      { path: "bundles", element: <AdminBundles /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "inventory", element: <AdminInventory /> },
      { path: "bulk", element: <AdminBulk /> },
      { path: "segments", element: <AdminSegments /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
]);

function App() {
  return (
    <>
      <AuthProvider>
      <SettingsProvider>
        <FlashSaleProvider>
          <CompareProvider>
            <Toaster position="top-right" />
            <RouterProvider router={router} />
          </CompareProvider>
        </FlashSaleProvider>
      </SettingsProvider>
    </AuthProvider>
    </>
  );
}

export default App;
