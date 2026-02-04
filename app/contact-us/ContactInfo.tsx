import { MapPin, Mail, Phone, Clock } from 'lucide-react';

export default function ContactInfo() {
  return (
    <section className=" py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        Visit us, call us, or write to us — we’re happy to help you
          </h2>
         
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Address */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white mb-6">
              <MapPin size={22} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Visit Us
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Timber Market, Sadar Bazar,<br />
              Karnal (132001), HR,<br />
              India
            </p>
          </div>

          {/* Email */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white mb-6">
              <Mail size={22} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Us
            </h3>
            <a
              href="mailto:itaradesigns.sj@gmail.com"
              className="text-gray-600 hover:text-black transition text-sm"
            >
              itaradesigns.sj@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white mb-6">
              <Phone size={22} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Call Us
            </h3>
            <a
              href="tel:+919978996817"
              className="text-gray-600 hover:text-black transition text-sm"
            >
              +91 99789 96817
            </a>
          </div>

          {/* Timing */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white mb-6">
              <Clock size={22} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Working Hours
            </h3>
            <p className="text-gray-600 text-sm">
              09:00 AM – 09:00 PM
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
