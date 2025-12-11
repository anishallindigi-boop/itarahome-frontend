'use client'
import React, { useEffect, useState } from 'react';
import { resetState, getsingleproductbyslug } from '@/redux/slice/ProductSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2, ShoppingCart, Truck, Shield, RefreshCw, CalendarClock } from 'lucide-react';
import Image from 'next/image';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const Page = () => {
  const params = useParams();
  const slug = params?.id as string | undefined;

  const dispatch = useAppDispatch();
  const { loading, error, singleProduct } = useAppSelector((state: RootState) => state.product);

  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(getsingleproductbyslug(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  // Set default variation & image when product loads
  useEffect(() => {
    if (singleProduct?.variations && singleProduct.variations.length > 0) {
      const first = singleProduct.variations[0];
      setSelectedVariation(first);
      setSelectedImage(singleProduct.product.mainImage || '');

    } else if (singleProduct?.product?.mainImage) {
      setSelectedImage(singleProduct.product.mainImage);
    }
  }, [singleProduct]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Product</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!singleProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const product = singleProduct.product;
  const variations = singleProduct.variations || [];

  const allImages = Array.from(new Set([
    product.mainImage,
    ...(product.gallery || []),
    ...variations.map((v: any) => v.image).filter(Boolean)
  ]));

  const handleVariationChange = (sizeValue: string) => {
    const variation = variations.find((v: any) => v.attributes.size === sizeValue);
    if (variation) {
      setSelectedVariation(variation);
      setSelectedImage(variation.image || product.mainImage);
    }
  };

  const finalPrice = selectedVariation?.sellingPrice ?? product.price;
  const originalPrice = selectedVariation?.regularPrice ?? product.discountPrice ?? product.price;
  const hasDiscount = finalPrice < originalPrice;

  return (
    <main className="min-h-screen bg-gray-50 py-[150px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <Image
                src={`${IMAGE_URL}/${selectedImage}`}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={`${IMAGE_URL}/${img}`}
                      alt={`thumb ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">₹{finalPrice}</span>
                {hasDiscount && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">₹{originalPrice}</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector */}
              {product.attributes?.[0]?.values?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Select Size</h3>
                  <div className="flex gap-3">
                    {product.attributes[0].values.map((size: any) => {
                      const available = variations.some((v: any) => v.attributes.size === size.value && v.stock > 0);
                      const isSelected = selectedVariation?.attributes?.size === size.value;

                      return (
                        <button
                          key={size._id}
                          onClick={() => handleVariationChange(size.value)}
                          disabled={!available}
                          className={`w-16 h-16 rounded-lg border-2 font-medium transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : available
                              ? 'border-gray-300 hover:border-gray-400'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {size.value.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock */}
              <p className="text-green-600 font-medium mb-6">
                {selectedVariation?.stock ?? product.stock} piece{selectedVariation?.stock > 1 ? 's' : ''} in stock
              </p>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-lg border border-gray-300 hover:bg-gray-100 text-xl"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-lg border border-gray-300 hover:bg-gray-100 text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mb-8">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>
                <button className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-xl transition">
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Free Shipping</p>
                </div>
                    <div className="text-center">
                <CalendarClock  className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">30 Days Return</p>
                </div>
                <div className="text-center">
                  <Shield className="w-10 h-10 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <div
                  className="prose prose-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.content || product.description }}
                />
              </div>
            </div>
          </div>
        </div>
      
    </main>
  );
};

export default Page;