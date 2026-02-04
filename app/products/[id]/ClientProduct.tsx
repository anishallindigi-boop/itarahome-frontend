'use client';
import React, { useEffect, useState } from 'react';
import { resetState, getProductBySlug } from '@/redux/slice/ProductSlice';
import { addToCart } from '@/redux/slice/CartItemSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle, Loader2, ShoppingCart, Truck, Shield, CalendarClock,
  Check, Package, Heart, Share2, Star, CheckCircle, ZoomIn,
  ChevronLeft, ChevronRight
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

type AttributeValue = {
  value: string;
  color?: string;
  image?: string;
};

type Attribute = {
  name: string;
  type?: 'text' | 'color' | 'image';
  values: string[] | AttributeValue[];
};

type Variation = {
  _id: string;
  sku?: string;
  price: number;
  discountPrice: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>;
};

type Category = {
  name: string;
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
  categoryid: Category[];
};

type Payload = {
  product: ProductData;
};

interface ClientProductProps {
  slug: string;
}

const ClientProduct: React.FC<ClientProductProps> = ({ slug }) => {
  const params = useParams();
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [showWishlistLogin, setShowWishlistLogin] = useState(false);

  const product = singleProduct?.product;

  useEffect(() => {
    if (slug) dispatch(getProductBySlug(slug));
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, slug]);

  const isNewSchema = (values: string[] | AttributeValue[]): values is AttributeValue[] => {
    return values.length > 0 && typeof values[0] === 'object' && 'value' in values[0];
  };

  const getAttributeValueString = (attrValue: string | AttributeValue): string => {
    return typeof attrValue === 'string' ? attrValue : attrValue.value;
  };

  useEffect(() => {
    if (product?.attributes?.length) {
      const defaults: Record<string, string> = {};
      product.attributes.forEach(attr => {
        const firstValue = attr.values?.[0];
        if (firstValue) {
          defaults[attr.name] = getAttributeValueString(firstValue);
        }
      });
      setSelectedAttr(defaults);
    }
  }, [product?.attributes]);

  const selectedVariation = React.useMemo(() => {
    if (!product?.variations?.length) return null;
    return product.variations.find(v =>
      Object.entries(selectedAttr).every(([key, val]) => v.attributes[key] === val)
    );
  }, [product?.variations, selectedAttr]);

  // Update images array with variation image as priority
  const allImages = React.useMemo(() => {
    if (!product) return [];
    
    const images = new Set<string>();
    
    // 1. Variation image FIRST if exists
    if (selectedVariation?.image) {
      images.add(selectedVariation.image);
    }
    
    // 2. Main image
    if (product.mainImage) {
      images.add(product.mainImage);
    }
    
    // 3. Gallery images
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(img => images.add(img));
    }
    
    return Array.from(images);
  }, [product, selectedVariation?.image]);

  // Reset to show variation image when variation changes
  useEffect(() => {
    if (selectedVariation?.image) {
      // Find the index of variation image in allImages
      const variationIndex = allImages.findIndex(img => img === selectedVariation.image);
      if (variationIndex !== -1) {
        setCurrentImageIndex(variationIndex);
      } else {
        setCurrentImageIndex(0);
      }
    }
  }, [selectedVariation?.image, allImages]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const finalPrice = selectedVariation?.discountPrice
    ?? product?.discountPrice
    ?? selectedVariation?.price
    ?? product?.price
    ?? 0;

  const originalPrice = selectedVariation?.price ?? product?.price ?? 0;

  const discountPercent = originalPrice && finalPrice && originalPrice > finalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const currentStock = selectedVariation?.stock ?? product?.stock ?? 0;

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
    
    if (!isAuthenticated) {
      setShowWishlistLogin(true);
      return;
    }

    dispatch(addToWishlist({ productId }));
    setLiked(true);
  };

  const handleAttributeSelect = (attrName: string, value: string) => {
    setSelectedAttr(prev => ({ ...prev, [attrName]: value }));
  };

  useEffect(() => {
    if (isAuthenticated && showLogin && product) {
      dispatch(addToCart({
        productId: product._id,
        quantity,
        productvariationid: selectedVariation?._id || undefined
      }));
      setShowLogin(false);
    }
    
    if (isAuthenticated && showWishlistLogin && product) {
      dispatch(addToWishlist({ productId: product._id }));
      setLiked(true);
      setShowWishlistLogin(false);
    }
    
    if (success) {
      router.push('/cart');
    }
  }, [isAuthenticated, showLogin, showWishlistLogin, success, product, selectedVariation, quantity, dispatch, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-stone-50">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (error || !product) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <AlertCircle className="w-16 h-16 text-rose-500 md:w-12 md:h-12" />
      <p className="text-lg text-center">Product not found or an error occurred.</p>
    </div>
  );

  const { name, description, content, attributes, categoryid } = product;

  const renderAttributeValue = (attr: Attribute, valueObj: AttributeValue | string, active: boolean) => {
    const isNewSchemaValue = typeof valueObj === 'object';
    const value = isNewSchemaValue ? valueObj.value : valueObj;
    const attrType = attr.type || 'text';

    const handleClick = () => {
      handleAttributeSelect(attr.name, value);
    };

    // Helper to truncate text based on screen size
    const truncateText = (text: string) => {
      const isMobile = window.innerWidth < 640;
      const maxLength = isMobile ? 60 : 60;
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    // TYPE 1: IMAGE - Show image thumbnail
    if (attrType === 'image' && isNewSchemaValue && valueObj.image) {
      return (
        <button
          key={value}
          onClick={handleClick}
          className={`relative group flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 rounded-lg md:rounded-xl border-2 transition-all cursor-pointer min-w-[60px] md:min-w-[80px] ${
            active
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'border-stone-200 bg-white hover:border-primary/50 hover:shadow-md'
          }`}
          title={value}
        >
          <div className="relative w-10 h-10 md:w-16 md:h-16 rounded-lg overflow-hidden">
            <img
              src={`${IMAGE_URL}${valueObj.image}`}
              alt={value}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {active && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary rounded-full p-0.5 md:p-1">
                  <Check className="w-2.5 h-2.5 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            )}
          </div>
          <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-stone-600'}`}>
            {truncateText(value)}
          </span>
        </button>
      );
    }

    // TYPE 2: COLOR - Show color swatch
    if (attrType === 'color' && isNewSchemaValue && valueObj.color) {
      return (
        <button
          key={value}
          onClick={handleClick}
          className={`relative group flex flex-col items-center gap-1 md:gap-2 p-1 md:p-3 rounded-lg md:rounded-xl border-2 transition-all cursor-pointer min-w-[50px] md:min-w-[70px] ${
            active
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-stone-200 bg-white hover:border-primary/50'
          }`}
          title={value}
        >
          <div className="relative">
            <div
              className={`w-8 h-8 md:w-12 md:h-12 rounded-full border-2 shadow-sm ${
                active ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
              }`}
              style={{ backgroundColor: valueObj.color }}
            />
            {active && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 md:p-1 shadow-md">
                <Check className="w-1.5 h-1.5 md:w-3 md:h-3 text-white" />
              </div>
            )}
          </div>
          <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-stone-600'}`}>
            {truncateText(value)}
          </span>
        </button>
      );
    }

    // TYPE 3: TEXT - Show simple button
    return (
      <button
        key={value}
        onClick={handleClick}
        className={`relative px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border-2 transition-all cursor-pointer text-sm md:text-base ${
          active
            ? 'border-primary bg-primary text-white shadow-md'
            : 'border-stone-200 bg-white hover:border-primary/50 hover:shadow-sm'
        }`}
        title={typeof value === 'string' ? value : value}
      >
        <span className="block text-xs md:text-sm">
          {truncateText(value)}
        </span>
        {active && <Check className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full p-0.5 text-white" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50 py-4 md:py-[100px]">
      {/* Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 text-2xl"
            onClick={() => setZoomImage(null)}
          >
            ×
          </button>
          <img 
            src={`${IMAGE_URL}${zoomImage}`}
            alt="Zoomed product"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Login Popup for Cart */}
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      
      {/* Login Popup for Wishlist */}
      {showWishlistLogin && <LoginPopup onClose={() => setShowWishlistLogin(false)} />}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Image Gallery */}
        <div className="space-y-3 md:space-y-4">
          {/* Main Image with Slider Controls */}
          <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-lg bg-white group">
            <img
              src={`${IMAGE_URL}${allImages[currentImageIndex] || '/placeholder.jpg'}`}
              alt={`${name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setZoomImage(allImages[currentImageIndex])}
              loading="eager"
            />
            
            {/* Zoom Button - Desktop Only */}
            <button
              className="hidden md:block absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-opacity opacity-0 group-hover:opacity-100"
              onClick={() => setZoomImage(allImages[currentImageIndex])}
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>

            {/* Slider Controls */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 md:p-2 rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 md:p-2 rounded-full shadow-lg"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-primary text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-base font-bold shadow-lg">
                {discountPercent}% OFF
              </div>
            )}

            {/* Image Counter - Mobile Only */}
            {allImages.length > 1 && (
              <div className="md:hidden absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Slider - Desktop Only */}
          {allImages.length > 1 && (
            <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-20 lg:w-24 lg:h-24 shrink-0 rounded-xl overflow-hidden ring-2 cursor-pointer transition-all ${
                    currentImageIndex === idx 
                      ? 'ring-primary scale-105 shadow-lg' 
                      : 'ring-transparent hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={`${IMAGE_URL}${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Mobile Image Dots */}
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 md:hidden">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full ${
                    currentImageIndex === idx ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4 md:gap-5 px-2 sm:px-0">
          {/* Category & Title */}
          <div>
            <p className="text-xs md:text-sm font-medium text-primary mb-1">
              {categoryid?.map(cat => cat.name).join(", ")}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-tight">
              {name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
              ))}
              <span className="text-xs sm:text-sm text-stone-500">(4.9 / 5)</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              ₹{finalPrice}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-lg sm:text-xl text-stone-400 line-through">
                  ₹{originalPrice}
                </span>
                <span className="text-xs md:text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                  Save ₹{originalPrice - finalPrice}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {description}
          </p>

          {/* Attributes */}
          {attributes?.map(attr => {
            const isNewSchemaAttr = isNewSchema(attr.values);
            const attrType = attr.type || 'text';

            return (
              <div key={attr.name} className="space-y-2 md:space-y-3">
                <label className="text-sm md:text-base font-semibold text-stone-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  {attr.name.charAt(0).toUpperCase() + attr.name.slice(1)}
                </label>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {isNewSchemaAttr ? (
                    (attr.values as AttributeValue[]).map(valueObj => {
                      const active = selectedAttr[attr.name] === valueObj.value;
                      return renderAttributeValue(attr, valueObj, active);
                    })
                  ) : (
                    (attr.values as string[]).map(value => {
                      const active = selectedAttr[attr.name] === value;
                      return renderAttributeValue(attr, value, active);
                    })
                  )}
                </div>
              </div>
            );
          })}

          {/* Stock Info */}
          <div className="flex items-center gap-2 text-sm md:text-base">
            {currentStock > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  In Stock ({currentStock} available)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-600">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex  sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border-2 border-stone-200 rounded-xl bg-white w-full sm:w-auto">
              <button
                className="px-4 py-3 cursor-pointer hover:bg-stone-50 transition flex-1 sm:flex-none text-lg"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="px-4 sm:px-6 font-semibold text-lg flex-1 text-center">
                {quantity}
              </span>
              <button
                className="px-4 py-3 cursor-pointer hover:bg-stone-50 transition flex-1 sm:flex-none text-lg"
                onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                disabled={quantity >= currentStock}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="flex-1 sm:flex-auto shadow-lg cursor-pointer text-white h-[52px] text-sm md:text-base"
              disabled={(attributes.length > 0 && !selectedVariation) || currentStock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Wishlist Button */}
            <button
              onClick={(e) => handleAddToWishlist(e, product._id)}
              className="p-3 rounded-xl border-2 cursor-pointer border-stone-200 bg-white hover:border-primary transition h-[52px] w-full sm:w-[52px] flex items-center justify-center"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-primary text-primary' : 'text-stone-400'}`} />
              <span className="ml-2 sm:hidden">Wishlist</span>
            </button>
          </div>

          {/* Perks Grid - Simplified for Mobile */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 text-sm text-stone-600">
           <Card className="p-3 flex items-center gap-2 bg-white shadow-sm">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure checkout</span>
            </Card>
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm">
              <CalendarClock className="w-5 h-5 text-primary" />
              <span>Easy returns</span>
            </Card>
          </div>

          {/* Description Accordion */}
          <Accordion type="single" collapsible className="w-full border rounded-xl px-3 md:px-4">
            <AccordionItem value="description" className="border-none">
              <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold text-stone-800 hover:no-underline py-3 md:py-4">
                Product Details
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none pt-3 md:pt-4 text-stone-600 text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mt-8 md:mt-16">
        {/* <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-800 mb-4 md:mb-6">
          You May Also Like
        </h2> */}
        <ProductsSlider />
      </div>
    </div>
  );
};

export default ClientProduct;