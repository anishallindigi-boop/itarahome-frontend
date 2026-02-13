// app/orders/order-success/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/hooks';
import { checkPaymentStatus, clearOrder } from '@/redux/slice/OrderSlice';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      // Verify payment status
      dispatch(checkPaymentStatus(orderNumber))
        .unwrap()
        .then((res) => {
          setOrder(res.order);
          // Clear cart and order state
          dispatch(clearOrder());
          // Clear any pending order session storage
          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('paymentSessionId');
        })
        .catch((err) => {
          console.error('Failed to verify order:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [orderNumber, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've sent a confirmation email to you.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order Number</span>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount Paid</span>
                  <p className="font-semibold text-gray-900">₹{order.total}</p>
                </div>
                <div>
                  <span className="text-gray-500">Payment Method</span>
                  <p className="font-semibold text-gray-900">{order.paymentMethod || 'Card/UPI'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transaction ID</span>
                  <p className="font-semibold text-gray-900">{order.txnId || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/orders/${orderNumber}`}>
              <Button className="gap-2">
                <Package className="w-4 h-4" />
                View Order Details
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}