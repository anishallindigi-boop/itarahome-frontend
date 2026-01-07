'use client';
import { Send, X, CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STORAGE_KEY = 'ops-enquiry-shown';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY=process.env.NEXT_PUBLIC_API_KEY;

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --- auto show once per session --- */
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShowModal(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /* --- body scroll lock --- */
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
  }, [showModal]);

  /* --- submit handler --- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/newsletter/create`, {
        email,
      },{
  headers: { "x-api-key": API_KEY }

}
      );

      setSuccess(true);

      // optional auto-close after 3s
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-xl w-full max-w-[550px] relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>

            <div className="bg-white p-8 rounded-2xl text-center">
              {/* LOGO */}
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="logo" className="h-[90px]" />
              </div>

              {/* SUCCESS STATE */}
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
                <>
                  {/* TITLE */}
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    Join the Essential Circle
                  </h2>

                  {/* SUBTEXT */}
                  <p className="text-sm text-gray-500 max-w-[24rem] mx-auto mb-6">
                    Become a part of the Itara community.  
                    Unlock a <strong>10% welcome benefit</strong> and get early
                    access to curated launches, and intimate styling previews.
                  </p>

                  {/* FORM */}
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      placeholder="Email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg py-3 px-4 border text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/30"
                    />

                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-black/80 transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? 'Joining...' : 'Join Now'}
                      {!loading && <Send size={16} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
