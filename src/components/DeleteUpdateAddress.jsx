import React, { useRef, useState, useContext } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { AuthContext } from '../context/AuthProvider'
import { Pencil, Trash2 } from 'lucide-react'

function DeleteUpdateAddress({ address, handleUpdateAddress, handleDeleteAddress }) {

    const [editedAddress, setEditedAddress] = useState({
        fullName: address.fullName,
        phone: address.phone,
        houseNo: address.houseNo,
        landmark: address.landmark,
        area: address.area,
        city: address.city,
        state: address.state,
        country: 'India'
    });

    const [pinCode, setPinCode] = useState(address.pinCode);

    const { user } = useContext(AuthContext);
    const ref = useRef(null);

    // Edit address
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editedAddress.fullName) {
            if (user.firstName) {
                setEditedAddress({
                    ...editedAddress,
                    fullName: `${user.firstName} ${user.lastName}`
                });
            } else {
                toast.error('Full name is required');
                return;
            }
        }

        if (!editedAddress.phone) {
            if (user.phone) {
                setEditedAddress({
                    ...editedAddress,
                    phone: user.phone
                });
            } else {
                toast.error('Phone number is required');
                return;
            }
        }

        if (editedAddress.phone && !/^[0-9]{10}$/.test(editedAddress.phone)) {
            toast.error('Phone number should be 10 digits');
            return;
        }

        if (address.fullName === editedAddress.fullName && address.phone === editedAddress.phone && address.houseNo === editedAddress.houseNo && address.landmark === editedAddress.landmark && address.area === editedAddress.area && address.city === editedAddress.city && address.state === editedAddress.state && address.country === editedAddress.country && address.pinCode === pinCode) {
            toast.info('No changes detected');
            return;
        }

        try {
            const toastId = toast.loading('Updating address...');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/update-address/${address._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...editedAddress, pinCode }),
                credentials: 'include',
            });
            toast.dismiss(toastId);

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Update failed");
                return;
            }

            handleUpdateAddress(data.address);
            toast.success(data.message || "Address updated!");
            ref.current.click();
        } catch (error) {
            console.log("error while updating address", error);
            toast.error("Something went wrong");
        }
    }

    const handleChange = (e) => {
        setEditedAddress({
            ...editedAddress,
            [e.target.name]: e.target.value
        })
    }

    const handlePinCodeChange = async (e) => {
        setPinCode(e.target.value);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${e.target.value}`);
            if (response.ok) {
                const data = await response.json();
                if (data[0]?.PostOffice?.length > 0) {
                    setEditedAddress({
                        ...editedAddress,
                        city: data[0].PostOffice[0].Block,
                        state: data[0].PostOffice[0].State
                    });
                } else {
                    setEditedAddress({
                        ...editedAddress,
                        city: '',
                        state: ''
                    });
                }
            }
        } catch (error) {
            console.log("error in fetching city", error);
        }
    }

    // Delete address
    const handleDelete = async () => {
        try {
            const toastId = toast.loading('Deleting address...');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/user/delete-address/${address._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            toast.dismiss(toastId);

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Delete failed");
                return;
            }
            handleDeleteAddress(address);
            toast.success(data.message || "Address deleted!");
        } catch (error) {
            console.log("error in deleting address", error);
            toast.error("Something went wrong");
        }
    }

    return (
        <div className='border-t px-5 py-3 flex items-center gap-2 bg-gray-50'>
            <Dialog>
                <DialogTrigger asChild>
                    <Button type='button' variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Pencil className="h-3 w-3" />
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent className="px-10 max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                        <DialogDescription>
                            Update your delivery address details
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-6 justify-center my-4'>
                        <div className='grid grid-cols-2 gap-y-5 gap-x-4'>
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    value={editedAddress.fullName}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Receiver's full name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    value={editedAddress.phone}
                                    onChange={handleChange}
                                    type="tel"
                                    className="py-5"
                                    id="phone"
                                    name="phone"
                                    placeholder="10-digit phone number"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="hfa">House No., Flat, Apartment</Label>
                                <Input
                                    value={editedAddress.houseNo}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="hfa"
                                    name="houseNo"
                                    placeholder="e.g. Flat 101, Tower B"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="landmark">Landmark</Label>
                                <Input
                                    value={editedAddress.landmark}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="landmark"
                                    name="landmark"
                                    placeholder="e.g. Near City Mall"
                                />
                            </div>
                            <div className="grid col-span-2 gap-2">
                                <Label htmlFor="asv">Area, Street, Village *</Label>
                                <Input
                                    value={editedAddress.area}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="asv"
                                    name="area"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pinCode">Pin Code *</Label>
                                <Input
                                    value={pinCode}
                                    onChange={handlePinCodeChange}
                                    className="py-5"
                                    id="pinCode"
                                    name="pinCode"
                                    placeholder="6-digit pincode"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    value={editedAddress.city}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="city"
                                    name="city"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    value={editedAddress.state}
                                    onChange={handleChange}
                                    className="py-5"
                                    id="state"
                                    name="state"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                    value={editedAddress.country || "India"}
                                    onChange={handleChange}
                                    disabled={true}
                                    className="py-5 bg-gray-50"
                                    id="country"
                                    name="country"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    className="bg-store-primary hover:bg-store-primary py-5"
                                >
                                    Save Changes
                                </Button>
                            </div>
                            <DialogClose asChild className="hidden">
                                <Button type="button" variant="secondary" ref={ref}>
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Button
                type="button"
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
                <Trash2 className="h-3 w-3" />
                Remove
            </Button>
        </div>
    )
}

export default DeleteUpdateAddress
