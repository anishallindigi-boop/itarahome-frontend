import { Facebook, Twitter, Youtube, Linkedin, MapPin, Mail, Phone, Clock, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-light mb-4"><img src='/logo.png' alt='logo' className="" /></h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Itara Home is Link design-led home décor brand focused on creating modern, minimal and thoughtfully crafted stone products.
            </p>
          </div>

          <div>
            <h4 className="text-lg mb-6">Get In Touch</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>Timber Market, Sadar Bazar, Karnal (132001)HR, India</span>
              </div>
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>itaradesigns.sj@gmail.com</span>
              </div>
              <div className="flex items-start">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>+91 9978996817</span>
              </div>
              <div className="flex items-start">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>09:00 AM - 09:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg mb-6">Quicklinks</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition">Home</Link></li>
              <li><Link href="#" className="hover:text-white transition">About</Link></li>
              <li><Link href="#" className="hover:text-white transition">FAQs</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-6">Newsletter</h4>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <button className="w-full px-6 py-2 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            Copyright © 2021 Itara home Project
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-400">Follow Us</span>
            <Link href="https://www.facebook.com/share/16NcEN22bK/?mibextid=wwXIfr" className="hover:text-gray-400 transition">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://www.instagram.com/itarahome/" className="hover:text-gray-400 transition">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-gray-400 transition">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-gray-400 transition">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}