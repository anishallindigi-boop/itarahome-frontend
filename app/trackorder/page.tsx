'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Search,
  ArrowRight,
  Box,
  Home,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  Printer
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// Status configurations
const STATUS_CONFIG: Record<string, {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ElementType;
  label: string;
  description: string;
}> = {
  order_placed: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Package,
    label: 'Order Placed',
    description: 'Your order has been confirmed'
  },
  processing: {
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Box,
    label: 'Processing',
    description: 'Order is being prepared'
  },
  awb_generated: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: CheckCircle2,
    label: 'AWB Generated',
    description: 'Shipping label created'
  },
  out_for_pickup: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: Truck,
    label: 'Out for Pickup',
    description: 'Courier arriving soon'
  },
  picked_up: {
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: Package,
    label: 'Picked Up',
    description: 'Package collected'
  },
  shipped: {
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    icon: Truck,
    label: 'Shipped',
    description: 'On the way to destination'
  },
  in_transit: {
    color: 'bg-sky-500',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    borderColor: 'border-sky-200',
    icon: MapPin,
    label: 'In Transit',
    description: 'Moving through network'
  },
  out_for_delivery: {
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: Truck,
    label: 'Out for Delivery',
    description: 'Arriving today'
  },
  delivered: {
    color: 'bg-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
    label: 'Delivered',
    description: 'Package delivered successfully'
  },
  cancelled: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Cancelled',
    description: 'Order has been cancelled'
  },
  returned: {
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: ArrowRight,
    label: 'Returned',
    description: 'Package returned to sender'
  }
};

// Types
interface TrackingData {
  orderNumber: string;
  currentStatus: string;
  orderDate?: string;
  orderDetails?: {
    createdAt?: string;
    items?: Array<{
      name: string;
      quantity: number;
      image?: string;
    }>;
    shippingAddress?: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  shipment?: {
    awb: string;
    courier: string;
    estimatedDelivery?: string;
    trackingUrl: string;
  };
  timeline?: Array<{
    status: string;
    label: string;
    description: string;
    date?: string;
    completed: boolean;
    active: boolean;
  }>;
  activities?: Array<{
    date: string;
    status: string;
    location: string;
    activity: string;
  }>;
}

// Format date utility
const formatDate = (dateString?: string) => {
  if (!dateString) return { date: '-', time: '-', full: '-' };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
};

// Loading Component
function TrackingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16 animate-pulse">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-48 mx-auto mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-32 mx-auto"></div>
    </div>
  );
}

// Main Component
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const urlOrderNumber = searchParams.get('order') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlOrderNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'activities'>('timeline');

  // Auto-search on mount if order in URL
  useEffect(() => {
    if (urlOrderNumber) {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const isOrderNumber = searchQuery.toUpperCase().startsWith('ORD');
      const endpoint = isOrderNumber 
        ? `/api/track/order/${searchQuery.toUpperCase()}`
        : `/api/track/awb/${searchQuery}`;

      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setTrackingData(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    if (!trackingData?.orderNumber) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/track/detail/${trackingData.orderNumber}`,
        
      );
      const data = await response.json();
      
      if (data.success) {
        setTrackingData(data.data);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusConfig = () => {
    return STATUS_CONFIG[trackingData?.currentStatus || 'processing'];
  };

  const StatusIcon = getCurrentStatusConfig().icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">Itara Home</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-600 hover:text-slate-900 font-medium">Home</Link>
            <Link href="/shop" className="text-slate-600 hover:text-slate-900 font-medium">Shop</Link>
            <Link href="/track" className="text-blue-600 font-medium">Track Order</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter your Order Number or AWB Number to get real-time updates on your shipment
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="Enter Order Number (e.g., ORD-20240217-1234) or AWB Number"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none text-lg font-medium uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Track
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && !trackingData && <TrackingSkeleton />}

        {/* Empty State */}
        {!trackingData && !loading && !error && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-16 h-16 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Track</h3>
            <p className="text-slate-500">Enter your order number above to see your shipment status</p>
            
            <div className="mt-8 flex justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Real-time Updates
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Live Tracking
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                SMS Alerts
              </div>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Status Hero Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className={`${getCurrentStatusConfig().bgColor} px-8 py-6 border-b ${getCurrentStatusConfig().borderColor}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${getCurrentStatusConfig().color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <StatusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold uppercase tracking-wider ${getCurrentStatusConfig().textColor} mb-1`}>
                        Current Status
                      </p>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {getCurrentStatusConfig().label}
                      </h2>
                      <p className="text-slate-600 mt-1">{getCurrentStatusConfig().description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={refreshTracking}
                      disabled={loading}
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      title="Print"
                      onClick={() => window.print()}
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Order Number</p>
                    <p className="text-xl font-bold text-slate-900 font-mono">{trackingData.orderNumber}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Placed on {formatDate(trackingData.orderDate || trackingData.orderDetails?.createdAt).full}
                    </p>
                  </div>
                  
                  {trackingData.shipment && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">AWB Number</p>
                        <p className="text-xl font-bold text-slate-900 font-mono">{trackingData.shipment.awb}</p>
                        <p className="text-sm text-slate-400 mt-1">{trackingData.shipment.courier}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Estimated Delivery</p>
                        <p className="text-xl font-bold text-slate-900">
                          {trackingData.shipment.estimatedDelivery 
                            ? formatDate(trackingData.shipment.estimatedDelivery).date
                            : 'Calculating...'
                          }
                        </p>
                        <a 
                          href={trackingData.shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                        >
                          Track on Shiprocket
                          <ChevronRight className="w-4 h-4" />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Timeline & Activities */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        activeTab === 'timeline' 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Journey Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        activeTab === 'activities' 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All Activities
                    </button>
                  </div>
                </div>

                {/* Timeline View */}
                {activeTab === 'timeline' && (
                  <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Shipment Progress
                    </h3>
                    
                    <div className="relative">
                      {trackingData.timeline?.map((step, index) => {
                        const isLast = index === (trackingData.timeline?.length || 0) - 1;
                        const StepIcon = STATUS_CONFIG[step.status]?.icon || Circle;
                        
                        return (
                          <div key={step.status} className="relative flex gap-6 pb-8 last:pb-0">
                            {/* Connecting Line */}
                            {!isLast && (
                              <div className={`absolute left-6 top-12 w-0.5 h-full ${
                                step.completed ? 'bg-green-500' : 'bg-slate-200'
                              }`} />
                            )}
                            
                            {/* Status Icon */}
                            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                              step.completed 
                                ? step.active 
                                  ? 'bg-green-500 ring-4 ring-green-100 scale-110' 
                                  : 'bg-green-500'
                                : 'bg-slate-100 border-2 border-slate-200'
                            }`}>
                              {step.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-2">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className={`font-bold text-lg ${
                                    step.active ? 'text-slate-900' : step.completed ? 'text-slate-700' : 'text-slate-400'
                                  }`}>
                                    {step.label}
                                  </h4>
                                  <p className={`mt-1 ${
                                    step.active ? 'text-slate-600' : step.completed ? 'text-slate-500' : 'text-slate-400'
                                  }`}>
                                    {step.description}
                                  </p>
                                </div>
                                {step.date && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-slate-900">
                                      {formatDate(step.date).date}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {formatDate(step.date).time}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Activities View */}
                {activeTab === 'activities' && (
                  <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                      Live Activities
                    </h3>
                    
                    <div className="space-y-4">
                      {trackingData.activities && trackingData.activities.length > 0 ? (
                        trackingData.activities.map((activity, idx) => (
                          <div 
                            key={idx}
                            className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
                          >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{activity.activity}</p>
                              <p className="text-sm text-slate-500 mt-1">{activity.location}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(activity.date).full}
                                </span>
                                <span className="px-2 py-1 bg-slate-200 rounded-full">
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No activities available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Order Details */}
              <div className="space-y-6">
                
                {/* Order Items */}
                <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-600" />
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {trackingData.orderDetails?.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-white"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Delivery Address
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="font-semibold text-slate-900">{trackingData.orderDetails?.shippingAddress?.name}</p>
                    <p className="text-slate-600 mt-2 leading-relaxed">
                      {trackingData.orderDetails?.shippingAddress?.address}
                    </p>
                    <p className="text-slate-600 mt-1">
                      {trackingData.orderDetails?.shippingAddress?.city}, {trackingData.orderDetails?.shippingAddress?.state}
                    </p>
                    <p className="text-slate-900 font-mono font-semibold mt-2">
                      PIN: {trackingData.orderDetails?.shippingAddress?.pincode}
                    </p>
                  </div>
                </div>

                {/* Support Card */}
                {/* <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-lg shadow-blue-600/25 p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Have questions about your delivery? Our support team is here to help.
                  </p>
                  <div className="space-y-3">
                    <a 
                      href="tel:+919876543210" 
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">+91 98765 43210</span>
                    </a>
                    <a 
                      href="mailto:support@itarahome.com"
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span className="font-medium">support@itarahome.com</span>
                    </a>
                  </div>
                </div> */}

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Page with Suspense boundary
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <TrackOrderContent />
    </Suspense>
  );
}