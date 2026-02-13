// app/orders/order-failed/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OrderFailedPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>

          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="font-semibold text-gray-900">{orderNumber}</p>
              {status && (
                <p className="text-sm text-red-600 mt-2">
                  Status: {status.replace(/_/g, ' ').toUpperCase()}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-600 mt-2">
                  Error: {error}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderNumber && (
              <Link href={`/checkout?retry=${orderNumber}`}>
                <Button className="gap-2">
                  <RefreshCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}