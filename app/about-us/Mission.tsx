// StoryMissionSection.jsx
import React from "react";
import { MessageCircle, Eye, Play } from "lucide-react";

const StoryMissionSection = () => {
  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* === Row 1: Image + Our Story === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 items-stretch">
          {/* Left image (previously empty div) */}
          <div className="w-full h-[260px] md:h-[320px] lg:h-[360px] overflow-hidden">
            <img
              src="/mission.jpeg" // 🔁 change this path to your actual image
              alt="Our story visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Our Story content */}
          <div className="animate-fade-up border border-gray-200 p-8 flex flex-col justify-between">
            <div className="flex flex-col space-y-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-semibold">Our Story</h2>

              {/* Text */}
              <p className="text-gray-600 text-sm leading-relaxed">
                Itara Home was born from a simple idea – to bring the timeless beauty of natural stone into everyday living.
What started as a love for clean, minimal design slowly grew into a collection of thoughtfully crafted trays, coasters and end tables that feel as good to use as they look.
              </p>
            </div>

            {/* Button */}
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center justify-center border border-black px-6 py-2 text-sm font-medium tracking-wide hover:bg-black hover:text-white transition"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* === Row 2: Our Mission + Video === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          {/* Our Mission */}
          <div className="animate-fade-up border border-gray-200 p-8 flex flex-col justify-between">
            <div className="flex flex-col space-y-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-semibold">Our Mission</h2>

              {/* Text */}
              <p className="text-gray-600 text-sm leading-relaxed">
              Our vision at Itara Home is to become a trusted name for timeless stone décor that brings calm, character and quiet luxury into everyday spaces. We aspire to see our pieces styled in homes, studios and projects where every detail is chosen with intention. By working with natural materials and minimal design, we aim to inspire people to create spaces that feel warm, modern and deeply personal – places they are proud to come home to.
              </p>
            </div>

            {/* Button */}
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center justify-center border border-black px-6 py-2 text-sm font-medium tracking-wide hover:bg-black hover:text-white transition"
              >
                Read More
              </a>
            </div>
          </div>

          {/* Video area with play button over image */}
          <div className="relative w-full h-[260px] md:h-[320px] lg:h-[360px] overflow-hidden">
            {/* Background image */}
            <img
              src="/vission.jpeg" // 🔁 change to your actual image
              alt="Pottery video"
              className="w-full h-full object-cover"
            />

            {/* Play button */}
            {/* <a
              href="https://www.youtube.com/embed/1MTkZPys7mU?feature=oembed?playlist=1MTkZPys7mU&mute=0&autoplay=0&loop=no&controls=0&start=0&end="
              className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg hover:scale-105 transition"
              aria-label="video-popup"
              target="_blank"
              rel="noreferrer"
            >
              <span className="absolute inset-0 rounded-full border border-red-500 animate-ping" />
              <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-500 text-white">
                <Play className="w-7 h-7 ml-0.5" />
              </span>
            </a> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryMissionSection;
