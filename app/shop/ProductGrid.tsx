const API_URL=process.env.NEXT_PUBLIC_API_URL;

export default function ProductGrid({ products }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((p: any) => (
        <div key={p._id} className="group">
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
            <img
              src={API_URL+p.mainImage}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>
          <h3 className="mt-3 text-sm font-medium">{p.name}</h3>
          <p className="text-sm text-gray-600">₹{p.discountPrice}</p>
        </div>
      ))}
    </div>
  );
}
