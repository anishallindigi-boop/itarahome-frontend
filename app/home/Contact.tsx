import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Youtube, Linkedin,Instagram } from 'lucide-react';

export default function Contact() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-sm tracking-widest text-gray-600 mb-4">CONTACT</p>
            <h2>Get In Touch</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
            Have a question about our Stone Collection or need help choosing the right pieces for your space?
We’re happy to assist with product details, styling suggestions, design consultancy and bulk enquiries.
            </p>
            {/* <div className="flex space-x-6 mb-12">
              <a href="https://www.facebook.com/share/16NcEN22bK/?mibextid=wwXIfr" className="hover:text-gray-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/itarahome/" className="hover:text-gray-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gray-600 transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div> */}
          </div>

          <div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Name *</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Email *</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Comment or Message *</label>
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* <div className="grid md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-gray-200">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium mb-1">Address</p>
              <p className="text-sm text-gray-600">Timber Market, Sadar Bazar, Karnal (132001)HR, India</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium mb-1">Phone</p>
              <p className="text-sm text-gray-600">+91 9978996817</p>
            
            </div>
          </div>
          <div className="flex items-start">
            <Mail className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium mb-1">Email</p>
              <p className="text-sm text-gray-600">itaradesigns.sj@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="w-5 h-5 mr-3 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium mb-1">Opening Hours</p>
              <p className="text-sm text-gray-600">Mon - Fri : 09:00 - 18:00</p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}