import axios from 'axios';
import { Facebook, Twitter, Youtube, Linkedin, MapPin, Mail, Phone, Clock, Instagram, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function Footer() {


  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/newsletter/create`, {
        email,
      }, {
        headers: { "x-api-key": API_KEY }

      }
      );

      setSuccess(true);

    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white text-white py-16 px-6 border-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-light mb-4"><img src='/itara.png' alt='logo' className="" /></h3>
            <p className="text-black text-sm leading-relaxed">
              Itara Home is Link design-led home décor brand focused on creating modern, minimal and thoughtfully crafted stone products.
            </p>
          </div>

          <div>
            <h4 className="text-lg text-black mb-6">Get In Touch</h4>
            <div className="space-y-3 text-sm text-black">
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
            <h4 className="text-lg text-black mb-6">Quicklinks</h4>
            <ul className="space-y-3 text-sm text-black">
              <li><Link href="#" className="hover:text-white transition">Home</Link></li>
              <li><Link href="#" className="hover:text-white transition">About</Link></li>
              <li><Link href="#" className="hover:text-white transition">FAQs</Link></li>
              <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg text-black mb-6">Newsletter</h4>
            <div className="w-full max-w-md">
              {success ? (
                <div className="space-y-4">
                  <CheckCircle className="mx-auto text-green-600" size={48} />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Thank You for Joining!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    You’re now part of the Essentia Circle.
                    Watch your inbox for exclusive updates & offers.
                  </p>
                </div>
              ) : (

                <form onSubmit={handleSubmit}>
                  <div className="flex items-center bg-primary border border-primary rounded-full px-4 py-2 focus-within:border-primary-500 transition">
                    <input
                      name="email"

                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2"
                    />

                    <button
                      aria-label="Subscribe"
                      className="ml-2 flex cursor-pointer items-center justify-center w-10 h-10 rounded-full bg-white text-black hover:bg-gray-200 transition"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}
</div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-black mb-4 md:mb-0">
            Copyright © 2021 Itara home Project
          </p>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-black">Follow Us</span>
            <Link href="https://www.facebook.com/share/16NcEN22bK/?mibextid=wwXIfr" className="hover:text-black transition">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://www.instagram.com/itarahome/" className="hover:text-black transition">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-black transition">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-black transition">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}