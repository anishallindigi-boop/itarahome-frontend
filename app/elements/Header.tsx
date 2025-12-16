'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, Search, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getCartItems } from '@/redux/slice/CartItemSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { CartPopover } from './CartPopover';
import { logoutuser ,resetState} from '@/redux/slice/AuthSlice';
import LoginPopup from './LoginPopup';
import { useRouter } from 'next/navigation';

import { toast } from "sonner"

/* ---------- one-time helper ---------- */
const useOnce = (fn: () => void) => {
  const ref = React.useRef(false);
  React.useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      fn();
    }
  }, []);
};

/* ---------- component ---------- */
export default function HeaderImproved() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);
  const [showLogin, setShowLogin] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);

  const dispatch = useAppDispatch();

  const { isAuthenticated, user,message ,error} = useAppSelector(
    (state: RootState) => state.auth)

  /* ---------- fetch cart once ---------- */
  useOnce(() => dispatch(getCartItems()));

  
  /* ---------- read & flatten cart ---------- */

    const {cart} = useAppSelector((state: RootState) => state.usercart)


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



  /* ---------- handlers ---------- */
  const handleUserClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowProfile((p) => !p);
  };

  React.useEffect(() => {
    if (isAuthenticated) setShowLogin(false);
  }, [isAuthenticated]);


React.useEffect(() => {
  if (message) {
    toast.success(message);
    dispatch(resetState());
  }
}, [message]);


    
  const menu = [
    { label: 'Home', href: '/' },
    {
      label: 'Products',
      children: [
        { label: 'Tray', href: '/#' },
        { label: 'Table', href: '/#' },
      ],
    },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact', href: '/contact-us' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[9999] bg-white backdrop-blur-md border-b h-20 px-8 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-5 w-1/3">
          <button onClick={() => setOpen(true)}>
            <Menu strokeWidth={1} size={25} />
          </button>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* CENTER LOGO */}
        <div className="w-1/3 flex justify-center">
          <Link href="/">
            <img src="/logo.png" alt="logo" className="h-18" />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 justify-end w-1/3">
        <div className="relative">
         <Button variant="ghost" size="icon" onClick={handleUserClick}>
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

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <User size={16} /> Profile
                  </Link>

                  <Link
                    href="/dashboard/orders"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Package size={16} /> Orders
                  </Link>

                  <button
                    onClick={() => {
                      dispatch(logoutuser());
                      setShowProfile(false);
                      router.refresh();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <CartPopover items={cartitems} />
        </div>
      </header>



         {/* ================= LOGIN POPUP ================= */}
      {showLogin && <LoginPopup />}

      {/* Drawer remains identical */}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="fixed inset-0 z-[10000] bg-white shadow-xl flex flex-col h-screen w-full sm:w-[350px]"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b">
                <h3 className="font-semibold text-lg">Menu</h3>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="overflow-y-auto p-4">
                <nav className="space-y-1">
                  {menu.map((item) => {
                    const hasChildren = !!item.children;
                    const isActive = active === item.label;
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => hasChildren && setActive(isActive ? null : item.label)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition"
                        >
                          <span className="font-medium text-base">
                      {item.href ? (
  <Link href={item.href}>{item.label}</Link>
) : (
  <span>{item.label}</span>
)}
                          </span>
                          {hasChildren && (
                            <ChevronDown
                              className={cn('w-4 h-4 transition-transform', isActive && 'rotate-180')}
                            />
                          )}
                        </button>
                        {hasChildren && (
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-2 mt-2 border-l pl-4 space-y-1 overflow-hidden"
                              >
                                {item.children!.map((sub) => (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    className="block py-2 text-sm rounded-md hover:bg-gray-100 transition"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </nav>
                <div className="mt-8 border-t pt-4 space-y-2">
                  <h4 className="text-sm font-semibold mb-2">Quick Links</h4>
                  {[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Orders', href: '/orders' },
                    { label: 'Help Center', href: '/#' },
                    { label: 'Bulk Enquiry', href: '/#-enquiry' },
                    { label: 'Book a consoultancy for stylinng and decor', href: '/#' },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}