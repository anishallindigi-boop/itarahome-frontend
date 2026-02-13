'use client';
import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminReviewsDashboard from './AdminReviewsDashboard';

// export const metadata: Metadata = {
//   title: 'Review Management | Admin Dashboard',
//   description: 'Manage and moderate customer reviews',
// };

export default function AdminReviewsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminReviewsDashboard />
      
      {/* Quick Actions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review Moderation Guidelines</CardTitle>
          <CardDescription>
            Follow these guidelines when moderating reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600">Approve reviews that:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Are genuine and helpful</li>
              <li>Follow community guidelines</li>
              <li>Provide constructive feedback</li>
              <li>Are from verified purchases</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600">Reject reviews that:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Contain hate speech or harassment</li>
              <li>Include spam or promotional content</li>
              <li>Share personal information</li>
              <li>Are unrelated to the product</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600">Best Practices:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>Respond to negative reviews professionally</li>
              <li>Flag suspicious reviews for investigation</li>
              <li>Check for duplicate reviews</li>
              <li>Review daily to maintain quality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}