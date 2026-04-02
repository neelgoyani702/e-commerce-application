import { useContext } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { GitCompareArrows, X } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import { CompareContext } from './context/CompareProvider'

function Layout() {
  const { compareCount, clearCompare } = useContext(CompareContext);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Compare Bar */}
      {compareCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 bg-gray-900 text-white pl-4 pr-2 py-2.5 rounded-full shadow-2xl border border-gray-700">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-store-primary" />
              <span className="text-sm font-semibold">
                {compareCount} product{compareCount !== 1 ? "s" : ""}
              </span>
            </div>
            <Link
              to="/compare"
              className="text-xs font-bold bg-store-gradient text-white px-4 py-1.5 rounded-full hover:opacity-90 transition-all"
            >
              Compare Now
            </Link>
            <button
              onClick={clearCompare}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout