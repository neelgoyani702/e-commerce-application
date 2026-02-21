import React from 'react'
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

function DeleteFromCart({ productId, handleDeleteCartItems }) {

  const handleDeleteFromCart = async () => {
    try {
      const toastId = toast.loading("Removing...");

      const response = await fetch(`${process.env.REACT_APP_API_URL}/cart/${productId?._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      toast.dismiss(toastId);

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to remove from cart");
        return;
      }

      if (data.cart) {
        handleDeleteCartItems(productId._id);
        toast.success("Removed from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Something went wrong");
    }
  }

  return (
    <Button
      onClick={handleDeleteFromCart}
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2"
      title="Remove from cart"
    >
      <Trash2 className='h-4 w-4' />
    </Button>
  )
}

export default DeleteFromCart