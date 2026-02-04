import Link from "next/link";


export default function Hero() {
  return (
    <section className="relative sm:mt-[80px] overflow-hidden">
      {/* 🔥 Overlay for readability */}
      <div className="absolute inset-0  z-10" />

      {/* 🔥 Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
        <h1
          className="
            !text-white font-extrabold
            text-[60px] sm:text-[36px] md:text-[48px] lg:text-[60px] xl:text-[90px]
            drop-shadow-[0_6px_25px_rgba(0,0,0,0.9)]
            tracking-wide old-standard-tt-regular
          "
        >
          The art of Stone
        </h1>

        <h2
          className="
            mt-3 !text-white font-medium
         text-3xl md:text-4xl
            drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]
            tracking-wide 
          "
        >
          Timeless Objects for Modern Homes
        </h2>
        <Link href="/shop" >
        <button className="mt-4 bg-white text-primary px-10 py-2 cursor-pointer font-semibold hover:bg-gray-100 transition">
          Shop Now
        </button>
        </Link>
      </div>

      {/* 🎥 Video */}
      <video
        className="w-full h-[70vh] sm:h-[80vh] md:h-screen object-cover"
        src="/home.mp4"
        autoPlay
        loop
        muted
        playsInline
        // poster="/hero.jpeg"
      />
    </section>
  );
}
