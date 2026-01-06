'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY=process.env.NEXT_PUBLIC_API_KEY;

export default function NewsletterTable() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     FETCH NEWSLETTER DATA
  ========================= */
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/newsletter/get`,{
             headers: { "x-api-key": API_KEY },withCredentials:true
        });
        setSubscribers(res.data.letter);
      } catch (err) {
        setError('Failed to load newsletter subscribers');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  return (
    <section className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔥 Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Newsletter Subscribers
          </h2>
          <p className="text-sm text-gray-500">
            Users who subscribed to your newsletter
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-center text-gray-500 py-10">
            Loading subscribers...
          </p>
        )}

        {error && (
          <p className="text-center text-red-600 py-10">{error}</p>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-2xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Subscribed On</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {subscribers.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* Email */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        {item.email}
                      </div>
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

            {subscribers.length === 0 && (
              <p className="text-center py-10 text-gray-500">
                No newsletter subscribers yet.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
