import React, { useContext } from 'react';
import { AuthContext } from "../context/AuthProvider";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, ShoppingBag, History, Lock, LogOut, ChevronRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
    {
        label: "Account",
        items: [
            { name: "Personal Information", to: "", icon: User, description: "Name, email & phone" },
            { name: "Manage Addresses", to: "/addresses", icon: MapPin, description: "Shipping & billing" },
            { name: "Change Password", to: "/change-password", icon: Lock, description: "Update your password" },
        ]
    },
    {
        label: "Orders",
        items: [
            { name: "Active Orders", to: "/orders", icon: ShoppingBag, description: "Track current orders" },
            { name: "Order History", to: "/order-history", icon: History, description: "Past & cancelled orders" },
        ]
    },
];

function AccountSidebar() {

    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

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
            console.error("Error in logout:", e);
        }
    };

    const isActive = (to) => {
        const fullPath = `/profile${to}`;
        if (to === "") return location.pathname === "/profile";
        return location.pathname === fullPath;
    };

    return (
        <div className='flex flex-col h-full'>
            {/* User Card */}
            <div className="p-5 pb-6">
                <div className="flex items-center gap-3.5">
                    <div className="relative">
                        <img
                            src={user?.image}
                            alt={user?.firstName || "user"}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-400/50 ring-offset-2"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Admin Badge */}
                {user?.role === "admin" && (
                    <Link
                        to="/admin/orders"
                        className="mt-3 flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs font-medium text-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                    >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin Dashboard</span>
                        <ChevronRight className="h-3 w-3 ml-auto" />
                    </Link>
                )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Navigation Groups */}
            <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
                {navigation.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] px-3 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.to}
                                        to={`/profile${item.to}`}
                                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${active
                                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/70 shadow-sm"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${active
                                            ? "bg-yellow-500 text-white shadow-sm shadow-yellow-200"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                                            }`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-tight ${active ? "text-yellow-900" : "text-gray-700 group-hover:text-gray-900"
                                                }`}>
                                                {item.name}
                                            </p>
                                            <p className={`text-[11px] leading-tight mt-0.5 ${active ? "text-yellow-700/70" : "text-gray-400"
                                                }`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        <ChevronRight className={`h-3.5 w-3.5 transition-all duration-200 ${active
                                            ? "text-yellow-500 translate-x-0"
                                            : "text-gray-300 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                            }`} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Logout */}
            <div className="p-3">
                <button
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full group"
                    onClick={logout}
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-500 transition-all duration-200">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default AccountSidebar