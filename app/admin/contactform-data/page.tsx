'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Phone, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY=process.env.NEXT_PUBLIC_API_KEY;

export default function ContactTable() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     FETCH CONTACT DATA
  ========================= */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/contactform/get`,{
               headers: { "x-api-key": API_KEY },withCredentials:true
        });
        setContacts(res.data.getdata);
      } catch (err) {
        setError('Failed to load contact enquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <section className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔥 Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Contact Enquiries
          </h2>
          <p className="text-sm text-gray-500">
            All customer messages and enquiries
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-gray-500 text-center py-10">Loading enquiries...</p>
        )}
        {error && (
          <p className="text-red-600 text-center py-10">{error}</p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-2xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-left">Message</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {contacts.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    {/* Name */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={14} />
                        {item.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail size={14} />
                        {item.email}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4 text-gray-600 max-w-md">
                      <p className="line-clamp-2">{item.message}</p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {contacts.length === 0 && (
              <p className="text-center py-10 text-gray-500">
                No enquiries found.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
