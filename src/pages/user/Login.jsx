import React, { useState, useContext, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { SettingsContext } from "../../context/SettingsProvider";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, ShoppingBag, Truck, ShieldCheck, Star } from "lucide-react";

function Login() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const login = async (userData) => {
        try {
            setSubmitting(true);
            const toastId = toast.loading("Logging in...");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            toast.dismiss(toastId);

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Login failed");
                return;
            }

            if (data.user) {
                setUser(data.user);
                navigate("/");
                toast.success("Welcome back, " + data.user.firstName + "!");
            }
        } catch (e) {
            toast.error(e.message || "Something went wrong");
            console.error("Error in login:", e);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex md:mt-16 mt-32">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 -left-20 w-72 h-72 bg-store-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-store-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-store-primary/5 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col justify-between w-full p-12">
                    {/* Top — Logo */}
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-store-primary rounded-xl flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">{settings?.storeName || "ShopKart"}</span>
                        </Link>
                    </div>

                    {/* Middle — Messaging */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Welcome back to<br />
                                <span className="text-store-primary">{settings?.storeName || "ShopKart"}</span>
                            </h2>
                            <p className="text-gray-400 mt-4 text-lg max-w-md">
                                Sign in to access your orders, wishlist, and exclusive member deals.
                            </p>
                        </div>

                        {/* Trust Badges */}
                        <div className="space-y-4">
                            {[
                                { icon: Truck, text: "Free delivery on all orders" },
                                { icon: ShieldCheck, text: "100% secure payments" },
                                { icon: Star, text: "Premium quality guaranteed" },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                        <badge.icon className="h-5 w-5 text-store-primary" />
                                    </div>
                                    <span className="text-gray-300 text-sm">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom — Testimonial */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-store-primary text-store-primary" />
                            ))}
                        </div>
                        <p className="text-gray-300 text-sm italic">
                            "Best shopping experience ever! Fast delivery and amazing quality products. Highly recommended."
                        </p>
                        <p className="text-gray-500 text-xs mt-3">— Happy Customer</p>
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50/50">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 bg-store-primary rounded-xl flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">{settings?.storeName || "ShopKart"}</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
                        <p className="mt-2 text-gray-500">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    onChange={handleChange}
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    required
                                    className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    onChange={handleChange}
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-12 bg-store-gradient hover:bg-store-gradient-light text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-store-primary hover:shadow-store-primary-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-gray-50/50 px-4 text-gray-400">or</span>
                        </div>
                    </div>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-store-primary-dark hover:text-store-primary transition-colors"
                        >
                            Create one →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;