import { Menu, Facebook, Twitter, Youtube, Linkedin, Play } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-50">

      <div className="relative h-[800px]  bg-[url('/herosection.jpg')] bg-cover bg-center bg-no-repeat flex items-center">
        <div className="absolute right-0 top-0 w-full md:w-3/5 h-full">
          {/* <img
           src="/public/herosection.jpg"
            className="w-full h-full object-cover"
          /> */}
          {/* <button className="absolute top-1/2 left-8 md:left-16 transform -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </button> */}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <p className="text-sm tracking-widest text-gray-600 mb-4">Itara Home – Stone Collection</p>
            <h1 className="text-6xl md:text-7xl font-light leading-tight mb-8">
            Natural stone pieces that bring quiet luxury into everyday living.
            </h1>
            <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
              Shop all
            </button>
          </div>
        </div>
{/* 
        <div className="absolute left-6 bottom-8 flex space-x-6">
          <a href="#" className="w-10 h-10 flex items-center justify-center hover:text-gray-600 transition">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center hover:text-gray-600 transition">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center hover:text-gray-600 transition">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center hover:text-gray-600 transition">
            <Linkedin className="w-5 h-5" />
          </a>
        </div> */}
      </div>
    </div>
  );
}