export default function Workshop() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          className="
            relative overflow-hidden
            bg-[url('/clay.jpeg')]
            bg-cover bg-center bg-no-repeat bg-fixed
            min-h-[400px] md:min-h-[650px]
            flex items-center justify-center
          "
        >
          {/* White content box */}
          <div className="text-center bg-white/95 max-w-2xl p-6 md:p-12">
            <p className="text-sm tracking-widest text-gray-600 mb-4">
             Itara Home
            </p>
            <h2>
             Natural stone pieces
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
             At Itara Home, we create timeless stone pieces that blend functionality with refined aesthetics. Each product is crafted from natural stone, celebrating its raw textures, subtle patterns, and unique character. From elegant trays to statement end tables, our Stone Collection is designed to elevate your home with effortless sophistication.
            </p>
            <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              Read More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
