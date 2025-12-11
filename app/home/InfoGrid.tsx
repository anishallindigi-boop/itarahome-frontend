import { Package, Layers, Play } from 'lucide-react';

export default function InfoGrid() {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-200 p-12 hover:shadow-lg transition-shadow">
            <Package className="w-12 h-12 text-gray-400 mb-6" strokeWidth={1} />
            <h3 className="text-3xl font-light mb-4">Our Products</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <div className="flex gap-4 mb-6 text-sm">
              <span className="font-medium border-b-2 border-gray-900 pb-1">Pottery</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Ceramic</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Textile</span>
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Accessories</span>
            </div>
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              All Product
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-12 hover:shadow-lg transition-shadow">
            <Layers className="w-12 h-12 text-gray-400 mb-6" strokeWidth={1} />
            <h3 className="text-3xl font-light mb-4">Our Process</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Mauris consequat tortor sed arcu mi lacinia. A bibendum mollis tempus. Aliquam luctus lectus sit amet mi venenatis. Id integer porta tempus at.
            </p>
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              How We Do It
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 p-12 hover:shadow-lg transition-shadow">
            <Package className="w-12 h-12 text-gray-400 mb-6" strokeWidth={1} />
            <h3 className="text-3xl font-light mb-4">The Studio</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nulla blandit sed orci vel sagittis. Nunc sollicitudin turpis quis bibendum aliquam accumsan. Maecenas vestibulum urna et mollis condi mentum.
            </p>
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              Visit Us
            </button>
          </div>

          <div className="relative overflow-hidden group">
            <img
              src="/fourth.jpg"
              alt="Studio"
              className="w-full h-[380px] object-cover"
            />
            <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}