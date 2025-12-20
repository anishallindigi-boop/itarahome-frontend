'use client';

import { useState } from 'react';

export default function Page() {
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

    // 👉 API call can be added here
    // fetch('/api/enquiry', { method: 'POST', body: JSON.stringify(formData) })
  };

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
    </section>
  );
}
