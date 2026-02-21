import React, { useContext, useEffect } from 'react'
import { AuthContext } from "../../context/AuthProvider";
import AccountSidebar from '../../components/AccountSidebar.jsx'
import { useNavigate, Link } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

function Profile() {

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  if (!user) {
    return (
      <div className="md:mt-16 mt-32 min-h-screen bg-gray-50/50 flex justify-center items-center">
        <div className="h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derive page title from route
  const pathEnd = location.pathname.replace('/profile', '');
  const pageTitle = {
    '': 'Personal Information',
    '/addresses': 'Manage Addresses',
    '/change-password': 'Change Password',
    '/orders': 'Active Orders',
    '/order-history': 'Order History',
  }[pathEnd] || 'My Account';

  return (
    <div className='md:mt-16 mt-32 min-h-screen bg-gray-50/50'>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-500/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-600">/</span>
            <span className="text-yellow-400 font-medium">My Account</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.image}
                alt={user?.firstName || "user"}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-yellow-400/30 ring-offset-2 ring-offset-gray-900"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Welcome back, {user?.firstName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Sidebar */}
          <aside className='lg:w-72 flex-shrink-0'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-28'>
              <AccountSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1 min-w-0'>
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Profile