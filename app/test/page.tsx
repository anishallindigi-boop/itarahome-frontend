'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import {
//   checkServiceability,
//   createShiprocketOrder,
//   generateLabel,
//   trackShipment,
//   cancelShiprocketOrder,
//   quickEstimate,
//   clearError,
//   clearMessage,
// } from '@/redux/slice/ShiprocketSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Truck, Tag, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShiprocketIntegration() {
  const dispatch = useAppDispatch();
  // const { loading, error, message, serviceability, createdOrder, label, tracking, cancellation } = useAppSelector((state) => state.shiprocket);

  const [activeTab, setActiveTab] = useState<'serviceability' | 'create' | 'track' | 'label' | 'estimate'>('serviceability');
  
  const [serviceabilityForm, setServiceabilityForm] = useState({
    pickup_postcode: '',
    delivery_postcode: '',
    weight: '',
    cod: '',
    length: '',
    breadth: '',
    height: '',
  });

  const [orderForm, setOrderForm] = useState({
    order_id: `ORD${Date.now()}`,
    order_date: new Date().toISOString().split('T')[0],
    billing_customer_name: '',
    billing_address: '',
    billing_city: '',
    billing_pincode: '',
    billing_state: '',
    billing_country: 'India',
    billing_email: '',
    billing_phone: '',
    shipping_charges: '',
    weight: '',
    payment_method: 'Prepaid',
  });

  const [trackForm, setTrackForm] = useState({
    shipmentId: '',
  });

  const [labelForm, setLabelForm] = useState({
    shipmentIds: '',
  });

  const [estimateForm, setEstimateForm] = useState({
    pickup_postcode: '',
    delivery_postcode: '',
    weight: '',
    cod: '',
  });

  const handleServiceabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await dispatch(checkServiceability({
      //   pickup_postcode: serviceabilityForm.pickup_postcode,
      //   delivery_postcode: serviceabilityForm.delivery_postcode,
      //   weight: parseFloat(serviceabilityForm.weight),
      //   cod: serviceabilityForm.cod ? parseFloat(serviceabilityForm.cod) : undefined,
      //   length: serviceabilityForm.length ? parseFloat(serviceabilityForm.length) : undefined,
      //   breadth: serviceabilityForm.breadth ? parseFloat(serviceabilityForm.breadth) : undefined,
      //   height: serviceabilityForm.height ? parseFloat(serviceabilityForm.height) : undefined,
      // })).unwrap();
      
      toast.success('Serviceability checked successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to check serviceability');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        order_id: orderForm.order_id,
        order_date: orderForm.order_date,
        pickup_location: 'Primary',
        billing_customer_name: orderForm.billing_customer_name,
        billing_address: orderForm.billing_address,
        billing_city: orderForm.billing_city,
        billing_pincode: orderForm.billing_pincode,
        billing_state: orderForm.billing_state,
        billing_country: orderForm.billing_country,
        billing_email: orderForm.billing_email,
        billing_phone: orderForm.billing_phone,
        shipping_is_billing: true,
        order_items: [
          {
            name: 'Sample Product',
            sku: 'SKU001',
            units: 1,
            selling_price: 1000,
            discount: 0,
            tax: 0,
            hsn: 123456,
          },
        ],
        payment_method: orderForm.payment_method,
        shipping_charges: parseFloat(orderForm.shipping_charges) || 0,
        total_discount: 0,
        sub_total: 1000,
        weight: parseFloat(orderForm.weight),
        length: 10,
        breadth: 10,
        height: 10,
      };

      // await dispatch(createShiprocketOrder(orderData)).unwrap();
      toast.success('Order created successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to create order');
    }
  };

  const handleGenerateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const shipmentIds = labelForm.shipmentIds.split(',').map(id => parseInt(id.trim()));
      // await dispatch(generateLabel(shipmentIds)).unwrap();
      toast.success('Label generated successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to generate label');
    }
  };

  const handleTrackShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await dispatch(trackShipment(parseInt(trackForm.shipmentId))).unwrap();
      toast.success('Tracking information fetched');
    } catch (err: any) {
      toast.error(err || 'Failed to track shipment');
    }
  };

  const handleQuickEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await dispatch(quickEstimate({
      //   pickup_postcode: estimateForm.pickup_postcode,
      //   delivery_postcode: estimateForm.delivery_postcode,
      //   cod: estimateForm.cod ? parseFloat(estimateForm.cod) : undefined,
      //   weight: estimateForm.weight ? parseFloat(estimateForm.weight) : undefined,
      // })).unwrap();
      toast.success('Estimate calculated successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to calculate estimate');
    }
  };

  // React.useEffect(() => {
  //   if (message) {
  //     const timer = setTimeout(() => {
  //       dispatch(clearMessage());
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [message, dispatch]);

  // React.useEffect(() => {
  //   if (error) {
  //     const timer = setTimeout(() => {
  //       dispatch(clearError());
  //     }, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [error, dispatch]);

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Shiprocket Integration
          </CardTitle>
          <CardDescription>
            Manage shipping, tracking, and logistics through Shiprocket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeTab === 'serviceability' ? 'default' : 'outline'}
              onClick={() => setActiveTab('serviceability')}
            >
              <Search className="w-4 h-4 mr-2" />
              Serviceability
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => setActiveTab('create')}
            >
              <Package className="w-4 h-4 mr-2" />
              Create Order
            </Button>
            <Button
              variant={activeTab === 'track' ? 'default' : 'outline'}
              onClick={() => setActiveTab('track')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Track Shipment
            </Button>
            <Button
              variant={activeTab === 'label' ? 'default' : 'outline'}
              onClick={() => setActiveTab('label')}
            >
              <Tag className="w-4 h-4 mr-2" />
              Generate Label
            </Button>
            <Button
              variant={activeTab === 'estimate' ? 'default' : 'outline'}
              onClick={() => setActiveTab('estimate')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Quick Estimate
            </Button>
          </div>

          {/* Messages */}
          {/* {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )} */}

          {/* Serviceability Form */}
          {activeTab === 'serviceability' && (
            <form onSubmit={handleServiceabilitySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Pickup Pincode"
                  value={serviceabilityForm.pickup_postcode}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, pickup_postcode: e.target.value})}
                  required
                />
                <Input
                  placeholder="Delivery Pincode"
                  value={serviceabilityForm.delivery_postcode}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, delivery_postcode: e.target.value})}
                  required
                />
                <Input
                  placeholder="Weight (kg)"
                  type="number"
                  step="0.01"
                  value={serviceabilityForm.weight}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, weight: e.target.value})}
                  required
                />
                <Input
                  placeholder="COD Amount"
                  type="number"
                  value={serviceabilityForm.cod}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, cod: e.target.value})}
                />
                <Input
                  placeholder="Length (cm)"
                  type="number"
                  value={serviceabilityForm.length}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, length: e.target.value})}
                />
                <Input
                  placeholder="Breadth (cm)"
                  type="number"
                  value={serviceabilityForm.breadth}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, breadth: e.target.value})}
                />
                <Input
                  placeholder="Height (cm)"
                  type="number"
                  value={serviceabilityForm.height}
                  onChange={(e) => setServiceabilityForm({...serviceabilityForm, height: e.target.value})}
                />
              </div>
              <Button type="submit">
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Check Serviceability
              </Button>

              {/* Serviceability Results */}
              {/* {serviceability && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Available Couriers:</h3>
                  <div className="space-y-2">
                    {serviceability.available_courier_companies?.map((courier, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{courier.courier_name}</span>
                          <span className="text-sm">₹{courier.freight_charge}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          ETD: {courier.etd} | Rating: {courier.rating} ⭐
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </form>
          )}

          {/* Create Order Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Order ID"
                  value={orderForm.order_id}
                  onChange={(e) => setOrderForm({...orderForm, order_id: e.target.value})}
                  required
                />
                <Input
                  type="date"
                  value={orderForm.order_date}
                  onChange={(e) => setOrderForm({...orderForm, order_date: e.target.value})}
                  required
                />
                <Input
                  placeholder="Customer Name"
                  value={orderForm.billing_customer_name}
                  onChange={(e) => setOrderForm({...orderForm, billing_customer_name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={orderForm.billing_phone}
                  onChange={(e) => setOrderForm({...orderForm, billing_phone: e.target.value})}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={orderForm.billing_email}
                  onChange={(e) => setOrderForm({...orderForm, billing_email: e.target.value})}
                  required
                />
                <Input
                  placeholder="Pincode"
                  value={orderForm.billing_pincode}
                  onChange={(e) => setOrderForm({...orderForm, billing_pincode: e.target.value})}
                  required
                />
                <Input
                  placeholder="Address"
                  value={orderForm.billing_address}
                  onChange={(e) => setOrderForm({...orderForm, billing_address: e.target.value})}
                  required
                />
                <Input
                  placeholder="City"
                  value={orderForm.billing_city}
                  onChange={(e) => setOrderForm({...orderForm, billing_city: e.target.value})}
                  required
                />
                <Input
                  placeholder="State"
                  value={orderForm.billing_state}
                  onChange={(e) => setOrderForm({...orderForm, billing_state: e.target.value})}
                  required
                />
                <Input
                  placeholder="Weight (kg)"
                  type="number"
                  step="0.01"
                  value={orderForm.weight}
                  onChange={(e) => setOrderForm({...orderForm, weight: e.target.value})}
                  required
                />
                <Input
                  placeholder="Shipping Charges"
                  type="number"
                  value={orderForm.shipping_charges}
                  onChange={(e) => setOrderForm({...orderForm, shipping_charges: e.target.value})}
                />
                <select
                  className="border rounded p-2"
                  value={orderForm.payment_method}
                  onChange={(e) => setOrderForm({...orderForm, payment_method: e.target.value})}
                >
                  <option value="Prepaid">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
              </div>
              <Button type="submit" >
             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Create Shiprocket Order
              </Button>

              {/* Created Order Results */}
              {/* {createdOrder && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Order Created Successfully!</h3>
                  <div className="space-y-1 text-sm">
                    <p>Order ID: {createdOrder.order_id}</p>
                    <p>Shipment ID: {createdOrder.shipment_id}</p>
                    <p>AWB Code: {createdOrder.awb_code}</p>
                    <p>Courier: {createdOrder.courier_name}</p>
                    <p>Status: {createdOrder.status}</p>
                  </div>
                </div>
              )} */}
            </form>
          )}

          {/* Track Shipment Form */}
          {activeTab === 'track' && (
            <form onSubmit={handleTrackShipment} className="space-y-4">
              <Input
                placeholder="Shipment ID"
                type="number"
                value={trackForm.shipmentId}
                onChange={(e) => setTrackForm({...trackForm, shipmentId: e.target.value})}
                required
              />
              <Button type="submit" >
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Track Shipment
              </Button>

              {/* Tracking Results */}
              {/* {tracking && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Tracking Information:</h3>
                  {tracking.shipment_track?.map((shipment, index) => (
                    <div key={index} className="mb-4 p-3 bg-white rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">AWB: {shipment.awb_code}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Current Status: {shipment.current_status_description}</p>
                        <p>ETD: {shipment.etd}</p>
                        <p>Source: {shipment.source}</p>
                        <p>Destination: {shipment.destination}</p>
                        {shipment.delivered_to && (
                          <p>Delivered To: {shipment.delivered_to}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
            </form>
          )}

          {/* Generate Label Form */}
          {activeTab === 'label' && (
            <form onSubmit={handleGenerateLabel} className="space-y-4">
              <Input
                placeholder="Shipment IDs (comma separated)"
                value={labelForm.shipmentIds}
                onChange={(e) => setLabelForm({...labelForm, shipmentIds: e.target.value})}
                required
              />
              <Button type="submit" >
               && <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generate Label
              </Button>

              {/* Label Results */}
              {/* {label && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Label Generated Successfully!</h3>
                  <div className="space-y-2">
                    {label.label_url && (
                      <a
                        href={label.label_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Download Label
                      </a>
                    )}
                    {label.manifest_url && (
                      <a
                        href={label.manifest_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-2"
                      >
                        Download Manifest
                      </a>
                    )}
                  </div>
                </div>
              )} */}
            </form>
          )}

          {/* Quick Estimate Form */}
          {activeTab === 'estimate' && (
            <form onSubmit={handleQuickEstimate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Pickup Pincode"
                  value={estimateForm.pickup_postcode}
                  onChange={(e) => setEstimateForm({...estimateForm, pickup_postcode: e.target.value})}
                  required
                />
                <Input
                  placeholder="Delivery Pincode"
                  value={estimateForm.delivery_postcode}
                  onChange={(e) => setEstimateForm({...estimateForm, delivery_postcode: e.target.value})}
                  required
                />
                <Input
                  placeholder="Weight (kg)"
                  type="number"
                  step="0.01"
                  value={estimateForm.weight}
                  onChange={(e) => setEstimateForm({...estimateForm, weight: e.target.value})}
                />
                <Input
                  placeholder="COD Amount"
                  type="number"
                  value={estimateForm.cod}
                  onChange={(e) => setEstimateForm({...estimateForm, cod: e.target.value})}
                />
              </div>
              <Button type="submit" >
             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Get Quick Estimate
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}