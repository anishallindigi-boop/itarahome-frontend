'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { checkPaymentStatus, getOrderByOrderNumber } from '@/redux/slice/OrderSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
  
  const orderNumber = searchParams.get('orderNumber');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setStatus('failed');
      setChecking(false);
      toast.error('Payment processing failed. Please try again.');
      return;
    }

    if (!orderNumber) {
      setStatus('failed');
      setChecking(false);
      toast.error('Invalid order reference');
      return;
    }

    // Check payment status
    const verifyPayment = async () => {
      try {
        const result: any = await dispatch(checkPaymentStatus(orderNumber));
        
        if (checkPaymentStatus.fulfilled.match(result)) {
          const paymentStatus = result.payload.order.paymentStatus;
          
          if (paymentStatus === 'charged') {
            setStatus('success');
            toast.success('Payment successful! Your order is confirmed.');
            
            // Fetch full order details
            await dispatch(getOrderByOrderNumber(orderNumber));
            
            // Redirect to success page after delay
            setTimeout(() => {
              router.push(`/orders/order-success?orderNumber=${orderNumber}`);
            }, 2000);
          } else if (['pending', 'pending_vbv', 'processing', 'initiated'].includes(paymentStatus)) {
            setStatus('pending');
            toast.info('Payment is still processing. Please wait...');
            
            // Poll again after 3 seconds
            setTimeout(() => verifyPayment(), 3000);
          } else {
            setStatus('failed');
            toast.error('Payment failed. Please try again.');
          }
        } else {
          setStatus('failed');
          toast.error('Could not verify payment status');
        }
      } catch (err) {
        setStatus('failed');
        toast.error('Error verifying payment');
      } finally {
        setChecking(false);
      }
    };

    verifyPayment();
  }, [orderNumber, error, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {checking ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment status.</p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600">Your order has been confirmed. Redirecting...</p>
            {orderNumber && (
              <p className="text-sm text-gray-500">Order: {orderNumber}</p>
            )}
          </div>
        ) : status === 'pending' ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Pending</h2>
            <p className="text-gray-600">Your payment is being processed. Please don't close this page.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-600">We couldn't process your payment. Please try again.</p>
            <div className="flex gap-4 justify-center mt-6">
              <Link href="/cart">
                <Button variant="outline">Back to Cart</Button>
              </Link>
              <Link href="/checkout">
                <Button>Try Again</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}