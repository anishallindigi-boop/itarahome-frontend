'use client';
import React, { useEffect, useState } from 'react';
import { resetState, getProductBySlug } from '@/redux/slice/ProductSlice';
import { addToCart } from '@/redux/slice/CartItemSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle, Loader2, ShoppingCart, Truck, Shield, CalendarClock,
  Check, Package, Heart, Share2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoginPopup from '@/app/elements/LoginPopup';
import { addToWishlist } from "@/redux/slice/WishlistSlice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductsSlider from './ProductsSlider';


const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL as string;

type Attribute = { name: string; values: string[] };

type Variation = {
  _id: string;
  sku?: string;
  price: number;
  discountPrice: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
};

type ProductData = {
  _id: string;
  name: string;
  description: string;
  content: string;
  price: number;
  discountPrice: number;
  stock: number;
  mainImage: string;
  gallery?: string[];
  attributes: Attribute[];
  variations?: Variation[];
  slug: string;
  isActive: boolean;
};

type Payload = {
  product: ProductData;
};


interface ClientProductProps {
  slug: string;
}


const ClientProduct: React.FC<ClientProductProps> = ({ slug }) => {
  const params = useParams();
//   const slug = params?.id as string | undefined;
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error, singleProduct } = useAppSelector((state: RootState) => state.product) as {
    loading: boolean;
    error: string | null;
    singleProduct: Payload | null;
  };

  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { success } = useAppSelector((state: RootState) => state.usercart);

  const [showLogin, setShowLogin] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState<Record<string, string>>({});
  const [manualImgIndex, setManualImgIndex] = useState<number>(-1); // -1 = no manual selection
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  const product = singleProduct?.product;

  // Fetch product
  useEffect(() => {
    if (slug) dispatch(getProductBySlug(slug));
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, slug]);

  // Set default attributes
  useEffect(() => {
    if (product?.attributes?.length) {
      const defaults: Record<string, string> = {};
      product.attributes.forEach(attr => {
        if (attr.values?.[0]) defaults[attr.name] = attr.values[0];
      });
      setSelectedAttr(defaults);
    }
  }, [product?.attributes]);

  // Reset manual image selection when variation changes (optional but recommended)
  useEffect(() => {
    setManualImgIndex(-1);
  }, [selectedAttr]);

  // Find selected variation
  const selectedVariation = React.useMemo(() => {
    if (!product?.variations?.length) return null;
    return product.variations.find(v =>
      Object.entries(selectedAttr).every(([key, val]) => v.attributes[key] === val)
    );
  }, [product?.variations, selectedAttr]);

  // All images for thumbnails
  const allImages = React.useMemo(() => {
    if (!product) return [];

    const baseImages = [
      product.mainImage,
      ...(Array.isArray(product.gallery) ? product.gallery : [])
    ].filter(Boolean);

    const variationImages = Array.isArray(product.variations)
      ? product.variations
          .map(v => v.image)
          .filter((img): img is string => Boolean(img))
      : [];

    return Array.from(new Set([...baseImages, ...variationImages]));
  }, [product]);

  // Current displayed image: manual click > variation image > main image
  const currentImage = React.useMemo(() => {
    // Highest priority: user manually clicked a thumbnail
    if (manualImgIndex !== -1 && allImages[manualImgIndex]) {
      return allImages[manualImgIndex];
    }

    // Next: variation-specific image
    if (selectedVariation?.image) {
      return selectedVariation.image;
    }

    // Fallback: main image
    return product?.mainImage || '';
  }, [manualImgIndex, allImages, selectedVariation, product?.mainImage]);

  // Price logic
  const finalPrice = selectedVariation?.discountPrice
    ?? product?.discountPrice
    ?? selectedVariation?.price
    ?? product?.price;

  const originalPrice = selectedVariation?.price ?? product?.price;

  const discountPercent = originalPrice && finalPrice && originalPrice > finalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  // Stock
  const currentStock = selectedVariation?.stock ?? product?.stock ?? 0;

  // Add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    if (product) {
      dispatch(addToCart({
        productId: product._id,
        quantity,
        productvariationid: selectedVariation?._id || undefined
      }));
    }
  };

  const handleAddToWishlist = (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault(); 
    e.stopPropagation();
    dispatch(addToWishlist({ productId }));
  };


  // Auto add after login + redirect
  useEffect(() => {
    if (isAuthenticated && showLogin && product) {
      dispatch(addToCart({
        productId: product._id,
        quantity,
        productvariationid: selectedVariation?._id || undefined
      }));
      setShowLogin(false);
    }
    if (success) {
      router.push('/cart');
    }
  }, [isAuthenticated, showLogin, success, product, selectedVariation, quantity, dispatch, router]);

  // Loading & Error
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen to-rose-50">
      <Loader2 className="w-10 h-10 animate-spin text-black" />
    </div>
  );

  if (error || !product) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="text-lg">Product not found or an error occurred.</p>
    </div>
  );

  const { name, description, content, attributes } = product;

  return (
    <div className="min-h-screen py-[100px]">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-white">
            <img
              src={`${IMAGE_URL}${currentImage || '/placeholder.jpg'}`}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {allImages.length > 0 ? (
              allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualImgIndex(idx)}
                  className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden ring-4 cursor-pointer transition ${
                    currentImage === img ? 'ring-white' : 'ring-transparent hover:ring-white'
                  }`}
                >
                  <img
                    src={`${IMAGE_URL}${img}`}
                    alt={`Product view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-500 text-xs">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium  mb-1">itarahome</p>
            <h1 className="text-4xl font-bold text-stone-800">{name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
              ))}
              <span className="text-sm text-stone-500">(4.9 / 5)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold ">₹{finalPrice}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-xl text-stone-400 line-through">₹{originalPrice}</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <p className="text-stone-700">{description}</p>

          {/* Attributes (Variations) */}
          {attributes?.map(attr => (
            <div key={attr.name} className="grid gap-3">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" />
                {attr.name.charAt(0).toUpperCase() + attr.name.slice(1)}
              </label>
              <div className="flex flex-wrap gap-3">
                {attr.values.map(value => {
                  const active = selectedAttr[attr.name] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedAttr(prev => ({ ...prev, [attr.name]: value }))}
                      className={`relative px-4 cursor-pointer py-2 rounded-xl border-2 transition-all ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-stone-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      {value}
                      {active && <Check className="inline-block w-4 h-4 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-xl bg-white">
              <button className="px-4 py-2 cursor-pointer" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="px-5 font-semibold">{quantity}</span>
              <button className="px-4 py-2 cursor-pointer" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <Button
              size="lg"
              className="flex-1 shadow-lg cursor-pointer text-white"
              disabled={attributes.length > 0 && !selectedVariation}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            <button
          onClick={(e) => {
  setLiked(p => !p);
  handleAddToWishlist(e, product._id);
}}
              className="p-3 rounded-xl border-2 cursor-pointer border-stone-200 bg-white hover:border-rose-300 transition"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            </button>

       
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3 text-xs text-stone-600">
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm">
              <Truck className="w-4 h-4 " />Free shipping
            </Card>
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm">
              <Shield className="w-4 h-4 " />Secure checkout
            </Card>
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm">
              <CalendarClock className="w-4 h-4 " />Easy returns
            </Card>
          </div>

          {/* Stock Info */}
          <p className="text-sm text-stone-600">
            Stock: <span className="font-semibold">{currentStock > 0 ? 'In stock' : 'Out of stock'}</span>
          </p>


      <Accordion type="single" collapsible className="w-full border px-4">
        <AccordionItem value="description" className="border-none">
          <AccordionTrigger className="text-2xl text-stone-800 hover:no-underline">
            Description
          </AccordionTrigger>

          <AccordionContent>
            <div
              className="prose prose-sm max-w-none pt-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
 
          {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
        </div>
      </div>

      {/* Full Description */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <ProductsSlider/>
       {/* <Card className="p-6">
      <Accordion
        type="single"
        collapsible
        defaultValue="description"
        className="w-full"
      >
        <AccordionItem value="description" className="border-none">
          <AccordionTrigger className="text-3xl font-bold text-stone-800 hover:no-underline">
            Product Description
          </AccordionTrigger>

          <AccordionContent>
            <div
              className="prose prose-sm max-w-none pt-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card> */}
      </div>
    </div>
  );
};

export default ClientProduct;