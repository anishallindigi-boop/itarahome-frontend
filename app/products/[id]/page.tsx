'use client';

import React, { useEffect, useState } from 'react';
import { resetState, getsingleproductbyslug } from '@/redux/slice/ProductSlice';
import { addToCart } from '@/redux/slice/CartItemSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useParams,useRouter } from 'next/navigation';
import {
  AlertCircle, Loader2, ShoppingCart, Truck, Shield, CalendarClock,
  Check, Package, Heart, Share2, Star
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LoginPopup from '@/app/elements/LoginPopup';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;

/* ---------- types (same as before) ---------- */
type Attribute = { name: string; values: { value: string; _id: string }[]; _id: string };
type Variation = {
  _id: string; sku: string; regularPrice: number; sellingPrice: number; stock: number;
  attributes: Record<string, string>;
};
type Product = {
  _id: string; name: string; description: string; content: string;
  price: string; discountPrice: string; stock: number | null;
  categoryId: { name: string }; attributes: Attribute[]; mainImage: string; gallery: string[];
  isActive: boolean; slug: string;
};
type Payload = { product: Product; variations: Variation[] };

const Page = () => {
  const params = useParams();
  const slug = params?.id as string | undefined;
  const dispatch = useAppDispatch();
  const router=useRouter()
  const { loading, error, singleProduct } = useAppSelector((state: RootState) => state.product) as {
    loading: boolean; error: string | null; singleProduct: Payload | null;
  };


  const [showLogin, setShowLogin] = useState(false);

    const { isAuthenticated} = useAppSelector(
      (state: RootState) => state.auth
    );

  const {message,success} = useAppSelector((state: RootState) => state.usercart)

const productId=singleProduct?.product._id



  /* ---------- local state ---------- */
  const [selectedAttr, setSelectedAttr] = useState<Record<string, string>>({});
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);


//----------add cart itrm----------



  /* ---------- fetch ---------- */
  useEffect(() => {
    if (slug) dispatch(getsingleproductbyslug(slug));
    return () => { dispatch(resetState()); };
  }, [dispatch, slug]);

  /* ---------- defaults ---------- */
  useEffect(() => {
    if (singleProduct?.product?.attributes?.length) {
      const defaults: Record<string, string> = {};
      singleProduct.product.attributes.forEach(a => {
        if (a.values?.[0]?.value) defaults[a.name] = a.values[0].value;
      });
      setSelectedAttr(defaults);
    }
  }, [singleProduct]);

  /* ---------- variation ---------- */
  const selectedVariation = React.useMemo(() => {
    if (!singleProduct?.variations?.length) return null;
    return singleProduct.variations.find(v =>
      Object.entries(selectedAttr).every(([k, val]) => v.attributes[k] === val)
    );
  }, [singleProduct, selectedAttr]);


const productvariationid = selectedVariation?._id || null;


  /* ---------- price ---------- */
  const finalPrice = selectedVariation?.sellingPrice || Number(singleProduct?.product?.discountPrice) || Number(singleProduct?.product?.price);
  const ogPrice    = selectedVariation?.regularPrice  || Number(singleProduct?.product?.price);
  const discount   = ogPrice && finalPrice && ogPrice > finalPrice ? Math.round(((ogPrice - finalPrice) / ogPrice) * 100) : 0;




const addcartitem = () => {
  if (!isAuthenticated) {
    setShowLogin(true);
    return;
  }

  if (productId) {
    dispatch(addToCart({ productId, quantity,productvariationid}));
  }

};


useEffect(() => {
  if (isAuthenticated && showLogin && productId) {
    dispatch(addToCart({ productId, quantity,productvariationid}));
    setShowLogin(false);
  }
  if(success){
    router.push('/cart')
  }
}, [isAuthenticated,success]);










  /* ---------- loading / error ---------- */
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-rose-50">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );
  if (error || !singleProduct) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="text-lg">Product not found or an error occurred.</p>
    </div>
  );

  const { product } = singleProduct;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-rose-50 py-[100px]">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        {/* ---------- Gallery ---------- */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-white">
            <img
              src={`${IMAGE_URL}/${product.gallery?.[activeImg] || product.mainImage}`}
              alt={product.name}
            
              className="object-cover"
             
            />
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {[product.mainImage, ...(product.gallery || [])].map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden ring-4 transition ${activeImg === idx ? 'ring-indigo-500' : 'ring-transparent hover:ring-indigo-300'}`}
              >
                <img src={`${IMAGE_URL}/${img}`} alt=""  className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Details ---------- */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">itarahome</p>
            <h1 className="text-4xl font-bold text-stone-800">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />)}
              <span className="text-sm text-stone-500">(4.9 / 5)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-indigo-600">₹{finalPrice}</span>
            {discount > 0 && (
              <>
                <span className="text-xl text-stone-400 line-through">₹{ogPrice}</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">{discount}% off</span>
              </>
            )}
          </div>


<p>{product.description}</p>
          {/* attributes – button style */}
          {product.attributes?.map(attr => (
            <div key={attr._id} className="grid gap-3">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" />
                {attr.name}
              </label>
              <div className="flex flex-wrap gap-3">
                {attr.values.map(v => {
                  const active = selectedAttr[attr.name] === v.value;
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedAttr(prev => ({ ...prev, [attr.name]: v.value }))}
                      className={`relative px-4 py-2 rounded-xl border-2 transition-all ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-stone-200 bg-white hover:border-indigo-300'}`}
                    >
                      {v.value}
                      {active && <Check className="inline-block w-4 h-4 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* qty + cta */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-xl bg-white">
              <button className="px-4 py-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="px-5 font-semibold">{quantity}</span>
              <button className="px-4 py-2" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <Button
              size="lg"
              className="flex-1 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              // disabled={!selectedVariation || (selectedVariation.stock ?? 0) <= 0}
               disabled={!!singleProduct?.variations?.length && !productvariationid}
onClick={addcartitem}

            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <button
              onClick={() => setLiked(p => !p)}
              className="p-3 rounded-xl border-2 border-stone-200 bg-white hover:border-rose-300 transition"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            </button>
            <button className="p-3 rounded-xl border-2 border-stone-200 bg-white hover:border-indigo-300 transition">
              <Share2 className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* perks */}
          <div className="grid grid-cols-3 gap-3 text-xs text-stone-600">
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm"><Truck className="w-4 h-4 text-indigo-500" />Free shipping</Card>
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm"><Shield className="w-4 h-4 text-indigo-500" />Secure checkout</Card>
            <Card className="p-3 flex items-center gap-2 bg-white shadow-sm"><CalendarClock className="w-4 h-4 text-indigo-500" />Easy returns</Card>
          </div>

 {showLogin && <LoginPopup />}

          {/* stock */}
          <p className="text-sm text-stone-600">
            Stock: <span className="font-semibold">{(selectedVariation?.stock ?? product.stock ?? 0) > 0 ? 'In stock' : 'Out of stock'}</span>
          </p>
        </div>
      </div>
       <div className='max-w-7xl mx-auto'>
                {/* description */}
          <Card className="p-5 bg-white shadow-sm">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.content }} />
          </Card>
       </div>
    </div>
  );
};

export default Page;