'use client';

import { useState } from 'react';

export default function page() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    spaceType: '',
    projectType: '',
    size: '',
    city: '',
    stylePreference: '',
    budget: '',
    includeProducts: '',
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
    console.log('Styling Consultation Enquiry:', formData);

    // 👉 Connect API / Email here
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-25">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold mb-3">
          Styling Consultation Enquiry
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Interested in styling your space with Itara Home? Share a few details
          below and we’ll get in touch to understand your requirements.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* YOUR DETAILS */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-medium mb-4">Your Details</h3>
        </div>

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

        {/* SPACE DETAILS */}
        <div className="md:col-span-2 mt-6">
          <h3 className="text-xl font-medium mb-4">Space Details</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Type of Space You’d Like to Style
          </label>
          <select
            name="spaceType"
            value={formData.spaceType}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select</option>
            <option>Living Room</option>
            <option>Bedroom</option>
            <option>Dining Area</option>
            <option>Bathroom</option>
            <option>Entryway</option>
            <option>Entire Home</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Is this a:</label>
          <select
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select</option>
            <option>New Home</option>
            <option>Refresh</option>
            <option>Final Styling</option>
            <option>Shoot Styling</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Approximate Size of Space (Optional)
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="e.g. 1200 sq ft"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location (City)
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* STYLING PREFERENCES */}
        <div className="md:col-span-2 mt-6">
          <h3 className="text-xl font-medium mb-4">Styling Preferences</h3>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Preferred Style
          </label>
          <select
            name="stylePreference"
            value={formData.stylePreference}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select</option>
            <option>Minimal</option>
            <option>Modern</option>
            <option>Warm Contemporary</option>
            <option>Neutral</option>
            <option>Unsure</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Budget Range (Optional)
          </label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g. ₹50,000 – ₹1,00,000"
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Include Itara Home products?
          </label>
          <select
            name="includeProducts"
            value={formData.includeProducts}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          >
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* ADDITIONAL INFO */}
        <div className="md:col-span-2 mt-6">
          <h3 className="text-xl font-medium mb-4">Additional Information</h3>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Tell us more about your space or requirements
          </label>
          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* SUBMIT */}
        <div className="md:col-span-2 text-center mt-6">
          <button
            type="submit"
            className="bg-black text-white px-10 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Request Styling Consultation
          </button>
        </div>
      </form>
    </section>
  );
}
