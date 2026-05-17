import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from "../../context/AuthProvider";
import { toast } from 'sonner';
import { MapPinnedIcon, Plus, Phone, Home } from 'lucide-react';
import {
    Dialog,
    DialogTrigger,
} from "../../components/ui/dialog"
import AddAdress from "../../components/AddAddress";
import DeleteUpdateAddress from '../../components/DeleteUpdateAddress';

function UserAddress() {

    const { user } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const getAddress = async () => {
            if (loaded) return;

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/user/get-address`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || "Failed to load addresses");
                    return;
                }

                if (data.address) {
                    setAddresses(data.address);
                }
            } catch (e) {
                console.log("Error: in get address", e);
                toast.error("Error loading addresses");
            } finally {
                setLoaded(true);
            }
        }

        getAddress();
    }, [loaded]);

    const handleAddAddress = (address) => {
        setAddresses([...addresses, address]);
    }

    const handleUpdateAddress = (address) => {
        const updatedAddresses = addresses.map((a) => (a._id === address._id ? address : a));
        setAddresses(updatedAddresses);
    }

    const handleDeleteAddress = (address) => {
        const updatedAddresses = addresses.filter((a) => (a._id !== address._id));
        setAddresses(updatedAddresses);
    }

    return (
        <div className='py-6 px-4 md:px-8'>
            {/* Header */}
            <div className='flex items-center gap-3 mb-8'>
                <div className="h-12 w-12 rounded-full bg-store-primary-light flex items-center justify-center">
                    <MapPinnedIcon size={24} className='text-store-primary-dark' />
                </div>
                <div>
                    <h1 className='text-2xl font-bold'>Your Addresses</h1>
                    <p className='text-sm text-gray-500'>Manage your delivery addresses</p>
                </div>
            </div>

            {/* Address Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {/* Add Address Card */}
                <Dialog>
                    <DialogTrigger asChild>
                        <div className='min-h-[220px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer flex flex-col justify-center items-center hover:border-store-primary hover:bg-store-primary/5 transition-all duration-300 group'>
                            <div className="h-14 w-14 rounded-full bg-gray-100 group-hover:bg-store-primary-light flex items-center justify-center mb-3 transition-colors">
                                <Plus size={28} className='text-gray-400 group-hover:text-store-primary transition-colors' />
                            </div>
                            <h3 className='text-base font-medium text-gray-600 group-hover:text-store-primary-dark transition-colors'>Add New Address</h3>
                        </div>
                    </DialogTrigger>
                    <AddAdress handleAddAddress={handleAddAddress} />
                </Dialog>

                {/* Address Cards */}
                {addresses.map((address) => (
                    <div key={address._id} className='min-h-[220px] border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden'>
                        <div className='p-5'>
                            <h3 className='font-semibold text-base mb-2'>{address.fullName || user.firstName}</h3>
                            <div className='text-sm text-gray-600 space-y-1'>
                                {address.houseNo && (
                                    <div className="flex items-start gap-2">
                                        <Home className="h-3.5 w-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                                        <span>{address.houseNo}</span>
                                    </div>
                                )}
                                {address.area && <p className="pl-5.5">{address.area}</p>}
                                <p className="pl-5.5">
                                    {[address.city, address.state, address.pinCode].filter(Boolean).join(", ")}
                                </p>
                                {address.country && <p className="pl-5.5 text-gray-400 text-xs">{address.country}</p>}
                                {address.phone && (
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{address.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DeleteUpdateAddress address={address} handleUpdateAddress={handleUpdateAddress} handleDeleteAddress={handleDeleteAddress} />
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {loaded && addresses.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <MapPinnedIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No addresses saved yet. Add one above!</p>
                </div>
            )}
        </div>
    )
}

export default UserAddress