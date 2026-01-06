'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import {logoutuser,getuser}  from '@/redux/slice/AuthSlice'
import { RootState, AppDispatch } from '@/redux/store';
import { useAppDispatch,useAppSelector } from '@/redux/hooks';
import ApiLoader from '../elements/ApiLoader';
import { toast } from "sonner"; 
import ProtectedRoute from '@/components/auth/ProtectedRoute';


interface AdminLayoutProps {
  children: React.ReactNode;
  // title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children}) => {


  const dispatch=useAppDispatch()

  const {loading,error:reserror,message,user,isAuthenticated}=useAppSelector((state:RootState)=>state.auth)

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);
  const pathname = usePathname();
  const router = useRouter();



// console.log(isdeleted,"isdeleted",message);
React.useEffect(() => {
    dispatch(getuser()).finally(() => {
      setIsChecking(false);
    });
  }, [dispatch]);

  // 2) Handle logout success toast + redirect
//   React.useEffect(() => {
//     if (isdeleted) {
//       toast.success(message);
//       router.push('/login');
//     }
//   }, [isdeleted, message, router]);


// 3) Protect admin routes: if not authenticated after loading -> login
  React.useEffect(() => {
    if (isChecking || loading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isChecking, loading, isAuthenticated, router]);

 const handleLogout = () => {
    dispatch(logoutuser());
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Product Category', href: '/admin/category', icon: FolderOpen },
    { name: 'Product Sub Category', href: '/admin/sub-category', icon: FolderOpen },
    { name: 'Product', href: '/admin/product', icon: Users },
    { name: 'Blog category', href: '/admin/blog-category', icon: Users },
    { name: 'Blogs', href: '/admin/blogs', icon: FileText },
    { name: 'Orders', href: '/admin/orders', icon: FileText },
    { name: 'EnquiryForm Data', href: '/admin/enquiry-form-data', icon: FileText },
    { name: 'StylingForm Data', href: '/admin/stylingform-data', icon: FileText },
    { name: 'contact Form Data', href: '/admin/contactform-data', icon: FileText },
    { name: 'Newsletter', href: '/admin/newsletter', icon: FileText },
 
  ];

//   if (!isAuthenticated) return null;


  return (
    <>
    <ProtectedRoute requiredRole="admin" redirectTo="/auth/login">
    {
      (isChecking || loading) ? <ApiLoader /> : (
    
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              {/* <h1 className="text-2xl font-bold text-gray-900">{title}</h1> */}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back, {user?.name}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  ) }
  </ProtectedRoute>
  </>
  );
};

export default AdminLayout;