import { Play, Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          className="
            grid md:grid-cols-2 gap-12 items-center
            bg-[url('/hero.jpeg')] bg-cover bg-center bg-no-repeat
            p-12 md:p-16 rounded-2xl
          "
        >
          <div className="relative min-h-[400px] md:min-h-[570px]">
            {/* Video thumbnail or dark overlay if you want */}
            <div className="absolute inset-0 bg-black/30 rounded-2xl" />

            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </button>
          </div>

          <div className="bg-white/80 p-6 rounded-2xl backdrop-blur">
            <Quote className="w-16 h-16 text-gray-300 mb-6" />
            <h2>Testimonials</h2>
            <p className="text-gray-700 leading-relaxed mb-8 italic">
           I absolutely love my purchase from Itara Home. The stone finish, the quality, and the attention to detail are beautiful. It instantly elevated my space
            </p>
            <div className="flex items-center">
              <img
                src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg"
                alt="Adam Martin"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-medium">Yashika Jain</p>
                <p className="text-sm text-gray-600">Karnal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
