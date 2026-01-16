'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getWishlist, removeFromWishlist } from '@/redux/slice/WishlistSlice';
import { addToCart,resetState } from '@/redux/slice/CartItemSlice';
import LoginPopup from '@/app/elements/LoginPopup';
import { useParams, useRouter } from 'next/navigation';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const WishlistDrawer = ({ isOpen, onClose }: Props) => {
 const router=useRouter()
  const dispatch = useAppDispatch();
  const { wishlist, loading } = useAppSelector((state: any) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const {message,success} = useAppSelector((state:any) => state.usercart)

    // console.log(success,"cart")

  const [showLogin, setShowLogin] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) dispatch(getWishlist());
  }, [dispatch, isOpen]);

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      setPendingProduct(productId);
      setShowLogin(true);
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    dispatch(removeFromWishlist(productId));
  };

  useEffect(() => {
    if (isAuthenticated && pendingProduct) {
      dispatch(addToCart({ productId: pendingProduct, quantity: 1 }));
      dispatch(removeFromWishlist(pendingProduct));
      setPendingProduct(null);
      setShowLogin(false);
    }
    if(success){
      router.push('/cart')
      dispatch(resetState())
    }
  }, [isAuthenticated,success,dispatch]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px]
        bg-white rounded-l-3xl shadow-2xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Heart className="text-rose-500" />
            Wishlist
            <span className="ml-1 text-sm text-gray-500">
              ({wishlist?.length || 0})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5 overflow-y-auto h-[calc(100%-72px)]">
          {loading ? (
            <div className="flex flex-col items-center mt-20 text-gray-400">
              <Heart className="h-10 w-10 animate-pulse mb-3" />
              Loading wishlist...
            </div>
          ) : wishlist?.length === 0 ? (
            <div className="text-center mt-24">
              <Heart className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">
                Your wishlist is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item: any) => (
                <div
                  key={item._id}
                  className="group flex gap-4 p-4 border rounded-2xl
                  hover:shadow-md transition"
                >
                  <Link
                    href={`/product/${item.product.slug}`}
                    onClick={onClose}
                  >
                    <img
                      src={`${IMAGE_URL}${item.product.mainImage}`}
                      alt={item.product.name}
                      className="w-[80px] h-[80px] rounded-xl object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-sm font-semibold text-indigo-600 mt-1">
                        ₹{item.product.discountPrice || item.product.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item.product._id)}
                        className="flex-1 flex items-center justify-center gap-1
                        text-xs bg-primary
                        text-white px-3 py-2 rounded-xl
                        hover:from-indigo-700 hover:to-indigo-600 transition"
                      >
                        <ShoppingCart size={14} />
                        Add to cart
                      </button>

                      <button
                        onClick={() =>
                          dispatch(removeFromWishlist(item.product._id))
                        }
                        className="p-2 rounded-lg text-rose-500
                        hover:bg-rose-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Login Popup */}
        {showLogin && <LoginPopup onClose={() => setShowLogin(false)}/>}
      </div>
    </>
  );
};

export default WishlistDrawer;
