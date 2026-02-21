import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "All Categories", to: "/category" },
    { name: "New Arrivals", to: "/category" },
    { name: "Deals & Offers", to: "/category" },
  ],
  account: [
    { name: "My Profile", to: "/profile" },
    { name: "My Orders", to: "/profile/orders" },
    { name: "Manage Addresses", to: "/profile/addresses" },
  ],
  support: [
    { name: "Help Center", to: "/contact" },
    { name: "About Us", to: "/about" },
    { name: "Contact Us", to: "/contact" },
  ],
};

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">ShopKart</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your one-stop shop for premium products at unbeatable prices.
              Quality you can trust, delivered to your door.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-yellow-600" />
                <span>support@shopkart.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-600" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-600" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-yellow-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">My Account</h4>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-yellow-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-yellow-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ShopKart. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-gray-300 cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-gray-300 cursor-pointer">
              Refund Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
