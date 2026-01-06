import { ArrowRight } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 p-5 lg:p-12 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-full h-full">
            <img
              src="/second-left.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
      <div className="relative bg-white p-6 sm:p-10 lg:p-20">

            <h2>About Us</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
             Itara Home is a design-led home décor brand focused on creating modern, minimal and thoughtfully crafted stone products. We believe your space should feel calm, beautiful and intentional.
            </p>
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              Read More
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 lg:p-12 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-full h-full ">
            <img
            src="/second-right.jpg"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative bg-white p-6 sm:p-10 lg:p-20">
            <h2>Our policy</h2>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <ArrowRight className="w-4 h-4 mr-3 text-gray-400" />
                <span>Natural Materials</span>
              </div>
              <div className="flex items-center text-gray-700">
                <ArrowRight className="w-4 h-4 mr-3 text-gray-400" />
                <span>Minimal Design</span>
              </div>
              <div className="flex items-center text-gray-700">
                <ArrowRight className="w-4 h-4 mr-3 text-gray-400" />
                <span>Everyday Functionality</span>
              </div>
            </div>
            <button className="px-6 py-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}