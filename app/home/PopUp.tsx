'use client';
import { Send, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';



const STORAGE_KEY = 'ops-enquiry-shown';

export default function Page() {

  /* --- state --- */
  const [showModal, setShowModal] = useState(false);

  /* --- form --- */
  // const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', message: '' });
  // const [showOTP, setShowOTP] = useState(false);
  // const [otp, setOTP] = useState('');

  // const locations = [
  //   'Mumbai, Maharashtra',
  //   'Pune, Maharashtra',
  //   'Bangalore, Karnataka',
  //   'Chennai, Tamil Nadu',
  //   'Ahmedabad, Gujarat',
  //   'Other',
  // ];

  /* --- 10-second auto-show, once per session --- */
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return; // user has seen it this session

    const timer = setTimeout(() => {
      setShowModal(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /* --- body scroll-lock --- */
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto';
  }, [showModal]);



  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-xl  w-full max-w-[550px] max-h-[90vh] overflow-y-auto  relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>


            <div className=" inset-0 bg-white flex items-center justify-center p-4">
              <div className=" w-full max-w-md bg-white text-white rounded-2xl  p-8">




                {/* Logo */}
                <div className="flex justify-center mb-4">
                  
                    {/* Simple stylized mark */}
                    <img src='/logo.png' />
                
                </div>


                {/* Title */}
                <h2 className="text-center text-xl font-semibold mb-2">
                  Join the Essentia Circle
                </h2>


                {/* Subtext */}
                <p className="text-center text-sm text-gray-400 max-w-[24rem] mx-auto leading-relaxed mb-6">
                  Become a Part of the Itara Community
Unlock a 10% welcome benefit as you sign up.
Stay ahead with early access to fresh arrivals, curated launches, and intimate styling previews.
                </p>


                {/* Email input + button */}
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Joined!");
                  }}
                >
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    className="w-full rounded-lg py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
                  />


                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-black/80 transition"
                  >
                    Join Now
                  </button>
                </form>
              </div>
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