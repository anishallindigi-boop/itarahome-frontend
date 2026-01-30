import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to check if product is sold out
const isSoldOut = (product: any) => {
  // Check main stock
  if (product.stock === 0) return true;
  
  // Check variations if they exist (all variations out of stock)
  if (product.variations && product.variations.length > 0) {
    const allVariationsOutOfStock = product.variations.every(
      (v: any) => v.stock === 0
    );
    return allVariationsOutOfStock;
  }
  
  return false;
};

export default function ProductGrid({ products }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p: any) => {
        const soldOut = isSoldOut(p);
        
        return (
          <Link 
            key={p._id} 
            href={`/products/${p.slug}`}
            className={soldOut ? 'pointer-events-none cursor-not-allowed' : ''}
          >
            <div className={`group relative ${soldOut ? 'opacity-60' : ''}`}>
              {/* Image Container */}
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                <img
                  src={API_URL + p.mainImage}
                  alt={p.name}
                  className={`w-full h-full object-cover transition ${soldOut ? '' : 'group-hover:scale-105'}`}
                />
                
                {/* 🚨 SOLD OUT Overlay */}
                {soldOut && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-sm">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <h3 className={`mt-3 text-sm font-medium ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>
                {p.name}
              </h3>
              
              <div className="mt-1 flex items-center gap-2">
                {p.discountPrice ? (
                  <>
                    <p className={`text-sm font-semibold ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>
                      ₹{p.discountPrice}
                    </p>
                    {!soldOut && p.price > p.discountPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ₹{p.price}
                      </p>
                    )}
                  </>
                ) : (
                  <p className={`text-sm font-semibold ${soldOut ? 'text-gray-400' : 'text-gray-900'}`}>
                    ₹{p.price}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}