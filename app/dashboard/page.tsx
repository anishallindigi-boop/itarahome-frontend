// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Heart, MapPin, Clock, ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAllOrders } from '@/redux/slice/OrderSlice';
import { Badge } from '@/components/ui/badge';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Helper function to get status variant
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return { variant: 'success', className: 'bg-green-100 text-green-800' };
    case 'processing':
      return { variant: 'secondary', className: 'bg-blue-100 text-blue-800' };
    case 'shipped':
      return { variant: 'info', className: 'bg-purple-100 text-purple-800' };
    case 'cancelled':
      return { variant: 'destructive', className: 'bg-red-100 text-red-800' };
    default:
      return { variant: 'outline', className: 'bg-gray-100 text-gray-800' };
  }
};

const UserDashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading, error } = useAppSelector((state) => state.order);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await dispatch(getAllOrders()).unwrap();
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
  }, [dispatch]);

  const recentOrders = orders.slice(0, 3);
  const pendingOrders = orders.filter(order => 
    ['processing', 'shipped'].includes(order.status.toLowerCase())
  ).length;

  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      link: '/dashboard/orders'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
      link: '/dashboard/orders?status=pending'
    },
    {
      title: 'Wishlist',
      value: '0', // You'll need to implement wishlist functionality
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50',
      link: '/dashboard/wishlist'
    },
    {
      title: 'Addresses',
      value: '2', // You'll need to implement address count
      icon: MapPin,
      color: 'text-green-500',
      bg: 'bg-green-50',
      link: '/dashboard/addresses'
    }
  ];

  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading dashboard: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-20">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-gray-500">Here's what's happening with your orders and account.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link href={stat.link} key={index} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt  as any).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <Badge 
                      variant={getStatusVariant(order.status).variant as any}
                      className={getStatusVariant(order.status).className}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Continue Shopping</h3>
            <p className="mt-1 text-sm text-gray-500">Discover our latest products</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Heart className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your Wishlist</h3>
            <p className="mt-1 text-sm text-gray-500">View your saved items</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Addresses</h3>
            <p className="mt-1 text-sm text-gray-500">Update your delivery addresses</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/addresses">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;