'use client';

export default function ShopFilters({
  categories,
  category,
  setCategory,
  price,
  setPrice,
  sort,
  setSort,
}: any) {
  return (
    <aside className="border rounded-2xl p-5 h-fit">
      <h2 className="font-semibold mb-4">Filters</h2>

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Category</h3>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="all">All</option>
          {categories.map(([slug, name]: any) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">
          Max Price: ₹{price}
        </h3>
        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-medium mb-2">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="default">Default</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}
