import { User } from 'lucide-react'
import React from 'react'

const page = () => {
  return (
    <section className="relative bg-gradient-to-br from-black-600 via-black-600 to-gray-700 py-40 overflow-hidden    bg-cover bg-center bg-no-repeat"    style={{
          // change to your actual image path
          backgroundImage: "url('/about-hero.png')",
        }}>
    <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full morphing-blob animate-float"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full morphing-blob animate-float" style={{ animationDelay: '3s' }}></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-fade-in-up">
                <User className="h-4 w-4 text-white mr-2" />
                <span className="text-sm font-semibold">INSIGHTS & EXPERTISE</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-8 text-shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Our <span className="text-yellow-300">Blog</span>
            </h1>

            <p className="text-2xl max-w-4xl mx-auto font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Stay updated with the latest insights, trends, and expertise from the world of real estate development and township planning
            </p>
        </div>
    </div>
</section>
  )
}

export default page