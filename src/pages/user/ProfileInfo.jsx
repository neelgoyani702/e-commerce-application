import React, { useState, useContext } from 'react'
import { AuthContext } from "../../context/AuthProvider";
import { User, Pencil, Mail, Phone, Check, X } from 'lucide-react';
import { toast } from 'sonner';

function ProfileInfo() {

    const { user, setUser } = useContext(AuthContext);
    const [userData, setUserData] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || ""
    });
    const [editEnabled, setEditEnabled] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userData.firstName || !userData.lastName) {
            toast.error('First name and last name are required');
            return;
        }

        if (userData.phone && !/^[0-9]{10}$/.test(userData.phone)) {
            toast.error('Phone number should be 10 digits');
            return;
        }

        if (userData.firstName === user.firstName && userData.lastName === user.lastName && userData.phone === user.phone) {
            toast.info('No changes detected');
            return;
        }
        try {
            const toastId = toast.loading('Updating profile...');

            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/update-user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            });

            toast.dismiss(toastId);
            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Update failed");
                return;
            }

            // Update AuthContext so the whole app reflects changes
            if (data.user) {
                setUser(data.user);
            }
            toast.success(data.message || "Profile updated!");
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        }
        setEditEnabled(false);
    }

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    }

    const handleCancel = (e) => {
        e.preventDefault();
        setEditEnabled(false);
        setUserData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || ""
        });
        toast.info('Changes discarded');
    }

    return (
        <div className='p-6 md:p-8'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-3'>
                    <div className="h-11 w-11 rounded-xl bg-yellow-50 flex items-center justify-center">
                        <User size={20} className='text-yellow-600' />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900 tracking-tight'>Personal Information</h1>
                        <p className='text-xs text-gray-400'>Manage your profile details</p>
                    </div>
                </div>
                {!editEnabled && (
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 px-4 py-2 rounded-xl transition-all"
                        onClick={() => {
                            setEditEnabled(true);
                            toast.info('You can now edit your profile');
                        }}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {/* First Name */}
                    <div className="space-y-2">
                        <label htmlFor="first-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            First Name
                        </label>
                        <input
                            value={userData.firstName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none ${editEnabled
                                    ? "border-gray-200 bg-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                                    : "border-gray-100 bg-gray-50/80 text-gray-700 cursor-default"
                                }`}
                            id="first-name"
                            name="firstName"
                            placeholder="Enter first name"
                            disabled={!editEnabled}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                        <label htmlFor="last-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Last Name
                        </label>
                        <input
                            value={userData.lastName}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none ${editEnabled
                                    ? "border-gray-200 bg-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                                    : "border-gray-100 bg-gray-50/80 text-gray-700 cursor-default"
                                }`}
                            id="last-name"
                            name="lastName"
                            placeholder="Enter last name"
                            disabled={!editEnabled}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <input
                                value={userData.email}
                                disabled={true}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/80 text-sm font-medium text-gray-500 cursor-not-allowed"
                                id="email"
                                name="email"
                            />
                        </div>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block"></span>
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <input
                                type="tel"
                                value={userData.phone}
                                onChange={handleChange}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none ${editEnabled
                                        ? "border-gray-200 bg-white focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                                        : "border-gray-100 bg-gray-50/80 text-gray-700 cursor-default"
                                    }`}
                                id="phone"
                                name="phone"
                                disabled={!editEnabled}
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {editEnabled && (
                    <div className="flex gap-3 pt-2">
                        <button
                            type='submit'
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 text-sm"
                        >
                            <Check className="h-4 w-4" />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-all duration-200 text-sm"
                            onClick={handleCancel}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}

export default ProfileInfo