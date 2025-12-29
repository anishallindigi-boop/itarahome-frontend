'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  User,
  Search,
  LogOut,
  Package,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getCartItems } from '@/redux/slice/CartItemSlice';
import { logoutuser, resetState } from '@/redux/slice/AuthSlice';
import { GetSubCategories } from '@/redux/slice/SubCategorySlice';
import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import { CartPopover } from './CartPopover';
import LoginPopup from './LoginPopup';
import WishlistDrawer from './WishlistDrawer';

import { toast } from 'sonner';

/* ---------- one-time helper ---------- */
const useOnce = (fn: () => void) => {
  const ref = React.useRef(false);
  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      fn();
    }
  }, []);
};

/* ---------- component ---------- */
export default function HeaderImproved() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [open, setOpen] = React.useState(false);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [openWishlist, setOpenWishlist] = React.useState(false);

  /* ---------- redux ---------- */
  const { isAuthenticated, user, message } = useAppSelector(
    (state: RootState) => state.auth
  );
  const { wishlist } = useAppSelector((state: RootState) => state.wishlist);
  const { cart } = useAppSelector((state: RootState) => state.usercart);
  const { categories } = useAppSelector((state) => state.productcategory);
  const { subCategories } = useAppSelector((state) => state.subcategory);

  /* ---------- fetch once ---------- */
  useOnce(() => dispatch(getCartItems()));

  /* ---------- fetch categories ---------- */
  useEffect(() => {
    dispatch(GetProductCategory());
    dispatch(GetSubCategories());
  }, [dispatch]);

  /* ---------- cart items ---------- */
  const cartitems = React.useMemo(
    () =>
      (cart || []).map((c: any) => ({
        _id: c._id,
        name: c.productId?.name ?? 'Unknown',
        image: c.productId?.mainImage ?? '',
        qty: c.quantity ?? 1,
        price: Number(c.productId?.discountPrice || c.productId?.price || 0),
      })),
    [cart]
  );

  /* ---------- auth handlers ---------- */
  const handleUserClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowProfile((p) => !p);
  };

  useEffect(() => {
    if (isAuthenticated) setShowLogin(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetState());
    }
  }, [message]);

  /* ---------- product menu ---------- */
  const productMenu = categories.map((cat: any) => ({
    label: cat.name,
    _id: cat._id,
    onClick: () => {
      const params = new URLSearchParams();
      params.set('categories', cat._id);
      router.push(`/shop?${params.toString()}`);
      setOpen(false);
    },
    children: subCategories
      .filter((sub: any) => sub.category?._id === cat._id)
      .map((sub: any) => ({
        label: sub.name,
        _id: sub._id,
        onClick: () => {
          const params = new URLSearchParams();
          params.set('categories', cat._id);
          params.set('subcategories', sub._id);
          router.push(`/shop?${params.toString()}`);
          setOpen(false);
        },
      })),
  }));

  const menu = [
    { label: 'Home', href: '/' },
    { label: 'Products', children: productMenu },
    { label: 'Shop', href: '/shop' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact', href: '/contact-us' },
    { label: 'Bulk Enquiry', href: '/enquiry-form' },
    { label: 'Book Consultation', href: '/styling-consultation-form' },
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-[9999] bg-white border-b h-20 px-8 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-5 w-1/3">
          <button onClick={() => setOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* LOGO */}
        <div className="w-1/3 flex justify-center">
          <Link href="/">
            <img src="/logo.png" alt="logo" className="h-14" />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 justify-end w-1/3">
          <Button variant="ghost" size="icon" onClick={handleUserClick}>
            <User size={20} />
          </Button>

          <button onClick={() => setOpenWishlist(true)} className="relative">
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full px-1">
                {wishlist.length}
              </span>
            )}
          </button>

          <CartPopover items={cartitems} />
        </div>
      </header>

      {/* ================= LOGIN ================= */}
      {showLogin && <LoginPopup />}
      <WishlistDrawer isOpen={openWishlist} onClose={() => setOpenWishlist(false)} />

      {/* ================= DRAWER ================= */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9998]"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="fixed z-[10000] bg-white h-full w-[320px] shadow-xl"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b">
                <h3 className="font-semibold text-lg">Menu</h3>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X />
                </Button>
              </div>

              <nav className="p-4 space-y-1 overflow-y-auto">
                {menu.map((item) => {
                  if (item.label === 'Products') {
                    return (
                      <div key={item.label} className="space-y-1">
                        {item.children!.map((cat: any) => {
                          const isOpen = expandedCategory === cat.label;

                          return (
                            <div key={cat.label} className="rounded-lg">
                              <button
                                onClick={() =>
                                  setExpandedCategory(isOpen ? null : cat.label)
                                }
                                className="w-full flex justify-between items-center p-3 hover:bg-gray-100 rounded-lg"
                              >
                                <span className="font-medium">{cat.label}</span>
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 transition-transform',
                                    isOpen && 'rotate-180'
                                  )}
                                />
                              </button>

                              <AnimatePresence>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pl-4 bg-gray-50"
                                  >
                                    {cat.children.map((sub: any) => (
                                      <button
                                        key={sub.label}
                                        onClick={sub.onClick}
                                        className="w-full flex justify-between items-center p-2 text-sm hover:bg-gray-100 rounded-md"
                                      >
                                        {sub.label}
                                        <ExternalLink size={14} />
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className="block p-3 rounded-lg hover:bg-gray-100 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
