'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  Package,
  CreditCard,
  UserCheck,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  ChartCandlestick,
  Wallet,
  X,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { getAllOrders } from '@/redux/slice/OrderSlice';
import { getProducts } from '@/redux/slice/ProductSlice';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Format currency in INR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get status badge variant with custom colors
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processing':
      return { variant: 'default', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' };
    case 'shipped':
      return { variant: 'default', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' };
    case 'delivered':
    case 'completed':
    case 'order success':
      return { variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' };
    case 'cancelled':
      return { variant: 'default', className: 'bg-red-100 text-red-700 hover:bg-red-100' };
    default:
      return { variant: 'default', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
  }
};

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Helper function to generate monthly sales data
const generateMonthlySalesData = (orders: any[]) => {
  const now = new Date();
  const months = [];
  
  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = format(date, 'MMM');
    
    // Filter orders for this month
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || 0);
      return (
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });
    
    const revenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    months.push({
      name: monthName,
      revenue,
      orders: monthOrders.length
    });
  }
  
  return months;
};

// Helper function to generate category distribution
const generateCategoryData = (products: any[]) => {
  const categories: Record<string, number> = {};
  
  products.forEach(product => {
    if (product.categoryid && product.categoryid.length > 0) {
      const category = product.categoryid[0]; // Assuming first category is primary
      categories[category] = (categories[category] || 0) + 1;
    }
  });
  
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  }));
};
const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state: RootState) => state.auth);
  const { orders, loading: ordersLoading, error } = useAppSelector((state: RootState) => state.order);
  const { products } = useAppSelector((state: RootState) => state.product);
  
  // Generate chart data from real data
  const salesData = generateMonthlySalesData(orders);
  const categoryData = generateCategoryData(products);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate dashboard stats from orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  // Calculate product stats
  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.status === 'published').length;
  const outOfStockProducts = products.filter(p => 
    parseInt(p.stock || '0') <= 0
  ).length;

  // Stats data
  const stats = [
    { 
      title: 'Total Products', 
      value: totalProducts.toString(),
      icon: Package, 
      change: `${Math.round((publishedProducts / totalProducts) * 100)}%`, 
      trend: 'up' 
    },
    { 
      title: 'Total Orders', 
      value: totalOrders.toString(), 
      icon: ShoppingCart, 
      change: totalOrders > 0 ? `${Math.round((completedOrders / totalOrders) * 100)}%` : '0%', 
      trend: 'up' 
    },
    { 
      title: 'Revenue', 
      value: formatCurrency(totalRevenue), 
      icon: Wallet, 
      change: '0%', // You can calculate this based on previous period
      trend: 'up' 
    },
    { 
      title: 'Out of Stock', 
      value: outOfStockProducts.toString(), 
      icon: ChartCandlestick, 
      change: '0%', 
      trend: outOfStockProducts > 0 ? 'up' : 'down' 
    },
  ];

  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getAllOrders()).unwrap(),
          dispatch(getProducts()).unwrap()
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Format order date
  const formatOrderDate = (dateString?: string) => formatDate(dateString);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="">
        {/* Top Navigation */}
        

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                      <div className={`mt-2 flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                        )}
                        <span>{stat.change} from last month</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/* Revenue and Orders Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue & Orders Overview</CardTitle>
                    <CardDescription>Monthly performance metrics</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {/* <Button variant="outline" size="sm">Week</Button>
                    <Button variant="outline" size="sm">Month</Button>
                    <Button size="sm">Year</Button> */}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip 
                        formatter={(value: any, name: any) => 
                          name === 'revenue' ? [formatCurrency(Number(value)), 'Revenue'] : [value, 'Orders']
                        }
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

           
          </div>

          {/* Products Table */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Products</CardTitle>
                  <CardDescription>Recently added products</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 5).map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {product.mainImage && (
                            <img 
                              src={API_URL+product.mainImage}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(parseFloat(product.price || '0'))}</TableCell>
                      <TableCell>{product.stock || '0'}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`px-3 py-1 rounded-full text-xs ${
                            product.status === 'published' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-400 text-white'
                          }`}
                        >
                          {product.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest transactions from your store</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-red-500">
                        Error loading orders: {error}
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber || 'N/A'}</TableCell>
                        <TableCell>{order.customerName || 'N/A'}</TableCell>
                        <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant(order.status).variant as any}
                            className={getStatusVariant(order.status).className}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total || 0)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;