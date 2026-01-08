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
  LayoutDashboard,
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
  const [openProducts, setOpenProducts] = React.useState(false);

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



  const handleDashboardClick = () => {


    // role based redirect
    if (user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }

    setShowProfile(false);
    setOpen(false);
  };



  const menu = [
   { key: 'home', label: 'Home', href: '/' },
  { key: 'shop', label: 'Shop', children: productMenu },
  // { key: 'shop', label: 'Shop', href: '/shop' },
  { key: 'about', label: 'About Us', href: '/about-us' },
  { key: 'contact', label: 'Contact', href: '/contact-us' },
  { key: 'bulk', label: 'Bulk Enquiry', href: '/enquiry-form' },
  { key: 'consult', label: 'Book Styling Consultation', href: '/styling-consultation-form' },
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-[9999] bg-white border-b h-20 px-8 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-5 w-1/3">
          <button onClick={() => setOpen(true)} className='cursor-pointer'>
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
            <img src="/logo.png" alt="logo" className="sm:h-19 h-16" />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 justify-end w-1/3">

          <div className="relative">
            <Button variant="ghost" size="icon" className='cursor-pointer' onClick={handleUserClick}>
              <User className="w-5 h-5" />
            </Button>

            {/* PROFILE DROPDOWN */}
            <AnimatePresence>
              {isAuthenticated && showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-[10001]"
                >
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold">
                      {user?.name || 'My Account'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
{user?.role === 'admin' ? (
  <Link
    href="/admin"
    onClick={() => setShowProfile(false)}
    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
  >
    <LayoutDashboard size={16} /> Admin Panel
  </Link>
) : (<>
  <Link
    href="/dashboard/profile"
    onClick={() => setShowProfile(false)}
    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
  >
    <User size={16} /> Profile
  </Link>
   <Link
    href="/dashboard"
    onClick={() => setShowProfile(false)}
    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
  >
    <LayoutDashboard size={16} /> Dashboard
  </Link>
  </>
)}
             {/* <Link
                    href="/dashboard/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User size={16} /> Profile
                  </Link>

                  <button
                    onClick={handleDashboardClick}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Package size={16} />
                    Dashboard
                  </button> */}


                  <button
                    onClick={() => {
                      dispatch(logoutuser());
                      setShowProfile(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          <button onClick={() => setOpenWishlist(true)} className="relative cursor-pointer">
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
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}


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
  if (item.label === 'Shop') {
    return (
      <div key={item.label} className="space-y-1">
        {/* PRODUCTS LABEL */}
        <button
          onClick={() => setOpenProducts((p) => !p)}
          className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 font-medium cursor-pointer"
        >
          <span>{item.label}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              openProducts && 'rotate-180'
            )}
          />
        </button>

        {/* CATEGORY DROPDOWN */}
        <AnimatePresence>
          {openProducts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-2 space-y-1"
            >
              {item.children!.map((cat: any) => {
                const isOpen = expandedCategory === cat.label;

                return (
                  <div key={cat._id} className="rounded-lg">
                    {/* CATEGORY */}
                    <button
                      onClick={() =>
                        setExpandedCategory(isOpen ? null : cat.label)
                      }
                      className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-sm font-medium">
                        {cat.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* SUBCATEGORY */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4 bg-gray-50 rounded-md"
                        >
                          {cat.children.map((sub: any) => (
                            <button
                              key={sub._id}
                              onClick={sub.onClick}
                              className="w-full flex justify-between items-center p-2 text-sm rounded-md hover:bg-gray-100 cursor-pointer"
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

               <Link href='/shop'
          // onClick={() => setOpenProducts((p) => !p)}
          className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 text-sm font-medium cursor-pointer"
        >
          <span>Shop All</span>
          <ExternalLink
            className={cn(
              'w-4 h-4 transition-transform',
            
            )}
          />
        </Link>
            </motion.div>
          )}
        </AnimatePresence>
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
