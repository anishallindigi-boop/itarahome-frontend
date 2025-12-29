import ProductCard from '../../components/ProductCard';

export default function ProductGrid({ products }: { products: any[] }) {
  if (!products?.length) {
    return <p>No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
