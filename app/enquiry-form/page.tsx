'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import {createEnquiry,resetState} from'@/redux/slice/EnquirySlice'
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {

const router=useRouter()
  const dispatch = useAppDispatch();
    const { loading, error, success,message } = useAppSelector(
      (state: RootState) => state.enquiry
    );
 const [countdown, setCountdown] = useState(10);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventType: '',
    quantity: '',
    requiredBy: '',
    products: '',
    customisation: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enquiry Data:', formData);

dispatch(createEnquiry(formData));
  };

 /* ================= COUNTDOWN ================= */
  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      dispatch(resetState());
      router.push('/');
    }

    return () => clearInterval(timer);
  }, [success, countdown, router, dispatch]);



  
  return (
    <section className="max-w-4xl mx-auto px-4 py-25">
      <h2 className="text-3xl font-semibold mb-8 text-center">
        Enquiry Details
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select Event</option>
            <option value="Wedding">Wedding</option>
            <option value="Housewarming">Housewarming</option>
            <option value="Corporate">Corporate</option>
            <option value="Private Gathering">Private Gathering</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Approximate Quantity Required
          </label>
          <input
            type="text"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Required By */}
        <div>
          <label className="block text-sm font-medium mb-1">Required By</label>
          <input
            type="date"
            name="requiredBy"
            value={formData.requiredBy}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Products */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Product(s) of Interest
          </label>
          <input
            type="text"
            name="products"
            value={formData.products}
            onChange={handleChange}
            placeholder="e.g. Oval Stone Tray, Marble Serveware"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Customisation */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Customisation Required?
          </label>
          <select
            name="customisation"
            value={formData.customisation}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Message */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Additional Details / Message
          </label>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Submit */}
        <div className="md:col-span-2 text-center">
          <button
            type="submit"
            className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Submit Enquiry
          </button>
        </div>

        {/* Fine Print */}
        <div className="md:col-span-2 text-xs text-gray-500 text-center mt-4">
          Each Itara Home piece is handcrafted in natural stone.
          <br />
          Minimum quantity applies for bulk orders. Timelines vary based on
          quantity and customisation.
        </div>
      </form>
      {success?(
          <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      >
        <motion.div
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />

          <h2 className="text-2xl font-bold mb-3">
            Thank you! 🎉
          </h2>

          <p className="text-gray-600 mb-5">
            {message || 'Your enquiry has been submitted successfully.'}
          </p>

          <div className="bg-green-50 text-green-700 py-3 rounded-lg font-medium">
            Redirecting in {countdown} seconds...
          </div>

          <button
            onClick={() => {
              dispatch(resetState());
              router.push('/');
            }}
            className="mt-6 text-sm text-gray-500 underline"
          >
            Go now
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
      ):""}
    </section>

  );
}
