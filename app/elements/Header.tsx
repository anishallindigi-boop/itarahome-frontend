'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  User,
  Search,
  LogOut,
  LayoutDashboard,
  Heart,
  ShoppingCart,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getCartItems } from '@/redux/slice/CartItemSlice';
import { logoutuser, resetState } from '@/redux/slice/AuthSlice';
import { GetSubCategories } from '@/redux/slice/SubCategorySlice';
import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';
import { fetchSearchSuggestions, clearSuggestions } from '@/redux/slice/ProductSlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import { CartPopover } from './CartPopover';
import LoginPopup from './LoginPopup';
import WishlistDrawer from './WishlistDrawer';

import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

/* ---------- debounce hook ---------- */
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  /* ---------- redux ---------- */
  const { isAuthenticated, user, message } = useAppSelector(
    (state: RootState) => state.auth
  );
  const { wishlist } = useAppSelector((state: RootState) => state.wishlist);
  const { cart } = useAppSelector((state: RootState) => state.usercart);
  const { categories } = useAppSelector((state) => state.productcategory);
  const { subCategories } = useAppSelector((state) => state.subcategory);
  const { suggestions, loading: searchLoading } = useAppSelector((state) => state.product);

  /* ---------- fetch once ---------- */
  useOnce(() => dispatch(getCartItems()));

  /* ---------- fetch categories ---------- */
  useEffect(() => {
    dispatch(GetProductCategory());
    dispatch(GetSubCategories());
  }, [dispatch]);

  /* ---------- search effect ---------- */
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      dispatch(fetchSearchSuggestions(debouncedSearchQuery));
    } else {
      dispatch(clearSuggestions());
    }
  }, [debouncedSearchQuery, dispatch]);

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
  }, [message, dispatch]);

  /* ---------- search handlers ---------- */
  const handleSuggestionClick = (product: any) => {
    router.push(`/products/${product.slug}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
    dispatch(clearSuggestions());
  };

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
    { key: 'home', label: 'Home', href: '/' },
    { key: 'shop', label: 'Shop', children: productMenu },
    { key: 'about', label: 'About Us', href: '/about-us' },
    { key: 'contact', label: 'Contact', href: '/contact-us' },
    { key: 'bulk', label: 'Bulk Enquiry', href: '/enquiry-form' },
    { key: 'consult', label: 'Book Styling Consultation', href: '/styling-consultation-form' },
  ];

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutuser());
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 w-full z-[9999] bg-white border-b h-20 px-4 md:px-8 flex items-center justify-between">
        {/* LEFT: Hamburger Menu + Desktop Search */}
        <div className="flex items-center gap-4 md:w-1/3">
          <button onClick={() => setOpen(true)} className='cursor-pointer p-2'>
            <Menu size={24} />
          </button>

          {/* DESKTOP SEARCH (Left side) */}
          <div className="relative w-64 hidden md:block search-container">
            <form>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    dispatch(clearSuggestions());
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* SEARCH DROPDOWN - PRODUCT SUGGESTIONS */}
            <AnimatePresence>
              {showSearchDropdown && (searchQuery.trim().length >= 2 || suggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute left-0 mt-3 w-[420px] bg-white border border-gray-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[10001] overflow-hidden"
                >
                  {/* HEADER */}
                  <div className="px-5 py-3 border-b flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      {searchLoading ? 'Searching...' : suggestions.length > 0 ? 'Suggestions' : 'No results'}
                    </p>
                    {searchLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                  </div>

                  {/* SUGGESTIONS LIST */}
                  <div className="max-h-[360px] overflow-y-auto">
                    {suggestions.length === 0 && !searchLoading && searchQuery.trim().length >= 2 && (
                      <div className="px-5 py-8 text-center text-gray-500">
                        <p className="text-sm">No products found</p>
                        <button
                          className="mt-2 text-sm text-primary hover:underline"
                        >
                          Search for &quot;{searchQuery}&quot;
                        </button>
                      </div>
                    )}

                    {suggestions.map((product: any) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
                      >
                        {/* Product Image */}
                        <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.mainImage ? (
                            <img
                              src={API_URL + product.mainImage}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Search size={16} />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                            {highlightMatch(product.name, searchQuery)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ₹{product.discountPrice || product.price}
                            {product.discountPrice && (
                              <span className="ml-1 line-through text-gray-400">
                                ₹{product.price}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ExternalLink size={14} className="text-gray-300 group-hover:text-gray-600" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER: Logo */}
        <div className="flex justify-center flex-1">
          <Link href="/">
            <img 
              src="/logo1.png" 
              alt="logo" 
              className="h-[60px] w-auto" 
            />
          </Link>
        </div>

        {/* RIGHT: Desktop Icons + Mobile Search */}
        <div className="flex items-center justify-end gap-2 md:gap-4 md:w-1/3">
          {/* Desktop: All three icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* User Icon */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className='cursor-pointer' 
                onClick={handleUserClick}
              >
                <User className="w-5 h-5 text-primary" />
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
                        <LayoutDashboard size={16} className='text-primary'/> Admin Panel
                      </Link>
                    ) : (<>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <User size={16} className='text-primary'/> Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowProfile(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <LayoutDashboard size={16} className='text-primary'/> Dashboard
                      </Link>
                    </>)}

                    <button
                      onClick={() => {
                        dispatch(logoutuser());
                        setShowProfile(false);
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className='text-primary'/> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Wishlist Icon */}
            <button 
              onClick={() => setOpenWishlist(true)} 
              className="relative cursor-pointer p-2"
            >
              <Heart size={20} className='text-primary'/>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <div className="hidden md:block">
              <CartPopover items={cartitems} />
            </div>
          </div>

          {/* Mobile: Search Button Only */}
          <button 
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2"
          >
            <Search size={22} />
          </button>
        </div>
      </header>

      {/* ================= MOBILE SEARCH OVERLAY ================= */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[10002] md:hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b">
              <Search size={20} className="text-gray-400" />
              <div className="flex-1">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full py-2 text-lg focus:outline-none"
                />
              </div>
              <button 
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery('');
                  dispatch(clearSuggestions());
                }}
                className="p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* MOBILE SUGGESTIONS */}
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              {searchLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}

              {!searchLoading && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p>No products found</p>
                </div>
              )}

              {suggestions.map((product: any) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full flex items-center gap-4 px-4 py-4 border-b hover:bg-gray-50 text-left"
                >
                  <div className="relative w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {product.mainImage ? (
                      <img
                        src={API_URL + product.mainImage}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Search size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{product.discountPrice || product.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Mobile Only: User Profile Section at Top of Drawer */}
              <div className="p-4 border-b md:hidden">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user?.name || 'My Account'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {user?.role === 'admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-2 p-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <LayoutDashboard size={16} className='text-primary'/> Admin
                        </Link>
                      ) : (<>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-2 p-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <User size={16} className='text-primary'/> Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-2 p-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <LayoutDashboard size={16} className='text-primary'/> Dashboard
                        </Link>
                      </>)}

                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 p-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <User size={18} />
                    Login / Register
                  </button>
                )}
              </div>

              {/* Mobile Only: Wishlist and Cart in Drawer */}
              <div className="p-4 border-b grid grid-cols-2 gap-3 md:hidden">
                <button
                  onClick={() => {
                    setOpenWishlist(true);
                    setOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Heart size={18} className='text-primary'/>
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    router.push('/cart');
                    setOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <ShoppingCart size={18} className='text-primary'/>
                  <span>Cart</span>
                  {cartitems.length > 0 && (
                    <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartitems.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Navigation Menu (for both mobile and desktop) */}
              <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-280px)] md:h-[calc(100vh-64px)]">
                {menu.map((item) => {
                  if (item.label === 'Shop') {
                    return (
                      <div key={item.label} className="space-y-1">
                        <button
                          onClick={() => setOpenProducts((p) => !p)}
                          className="w-full flex justify-between items-center p-3 font-medium rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <span className='font-medium'>{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 transition-transform text-primary',
                              openProducts && 'rotate-180'
                            )}
                          />
                        </button>

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
                                          'w-4 h-4 transition-transform text-primary',
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

                              <Link 
                                href='/shop'
                                onClick={() => setOpen(false)}
                                className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 text-sm font-medium cursor-pointer"
                              >
                                <span>Shop All</span>
                                <ExternalLink size={16} />
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

// Helper to highlight matching text
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return parts.map((part, index) => 
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="text-primary font-semibold bg-primary/10 rounded px-0.5">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}