import React, { useState, useContext } from 'react'
import { AuthContext } from "../../context/AuthProvider";
import { User, Pencil, Mail, Phone, Check, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
        <div className='py-6 px-5 md:px-8'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-3'>
                    <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                        <User size={20} className='text-yellow-600' />
                    </div>
                    <div>
                        <h1 className='text-lg font-bold text-gray-900'>Personal Information</h1>
                        <p className='text-xs text-gray-400'>Manage your profile details</p>
                    </div>
                </div>

                {!editEnabled && (
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-all"
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

            {/* Profile Card */}
            <div className="bg-gray-50/80 rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={user?.image}
                            alt={user?.firstName || "user"}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-yellow-400/20 ring-offset-2"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        <span className="inline-flex items-center mt-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</Label>
                        <Input
                            value={userData.firstName}
                            onChange={handleChange}
                            className={`py-5 rounded-xl border-gray-200 ${editEnabled ? 'bg-white focus:border-yellow-400 focus:ring-yellow-400/20' : 'bg-gray-50/80'}`}
                            id="first-name"
                            name="firstName"
                            placeholder="Enter first name"
                            disabled={!editEnabled}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</Label>
                        <Input
                            value={userData.lastName}
                            onChange={handleChange}
                            className={`py-5 rounded-xl border-gray-200 ${editEnabled ? 'bg-white focus:border-yellow-400 focus:ring-yellow-400/20' : 'bg-gray-50/80'}`}
                            id="last-name"
                            name="lastName"
                            placeholder="Enter last name"
                            disabled={!editEnabled}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            Email
                        </Label>
                        <Input
                            value={userData.email}
                            disabled={true}
                            className="py-5 rounded-xl bg-gray-50/80 border-gray-200"
                            id="email"
                            name="email"
                        />
                        <p className="text-[11px] text-gray-400">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            Phone Number
                        </Label>
                        <Input
                            type="tel"
                            value={userData.phone}
                            onChange={handleChange}
                            className={`py-5 rounded-xl border-gray-200 ${editEnabled ? 'bg-white focus:border-yellow-400 focus:ring-yellow-400/20' : 'bg-gray-50/80'}`}
                            id="phone"
                            name="phone"
                            disabled={!editEnabled}
                            placeholder="e.g. 9876543210"
                        />
                    </div>
                </div>

                {/* Actions */}
                {editEnabled && (
                    <div className="flex gap-3 pt-2">
                        <button
                            type='submit'
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
                        >
                            <Check className="h-4 w-4" />
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:border-gray-300 transition-all"
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