'use client';

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
} from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY=process.env.NEXT_PUBLIC_API_KEY;

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/contactform/create`, form,{
          headers: { "x-api-key": API_KEY }
      });
      setSuccess(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to send message. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* LEFT */}
          <div>
            <p className="text-sm tracking-widest text-gray-600 mb-4">
              CONTACT
            </p>
            <h2 className="text-3xl font-semibold mb-4">Get In Touch</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Have a question about our Stone Collection or need help choosing
              the right pieces for your space? We’re happy to assist with
              product details, styling suggestions, design consultancy and
              bulk enquiries.
            </p>
          </div>

          {/* RIGHT – FORM */}
          <div>
            {success ? (
              <div className="border border-green-200 bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Thank You!
                </h3>
                <p className="text-sm text-green-600">
                  Your message has been sent successfully.  
                  Our team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm mb-2">Name *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Comment or Message *
                  </label>
                  <textarea
                    name="message"
                    placeholder="Message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
