export default function Hero() {
  return (
    <section className="relative sm:mt-[80px] overflow-hidden">
      {/* 🔥 Overlay for readability */}
      <div className="absolute inset-0  z-10" />

      {/* 🔥 Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
        <h1
          className="
            text-white font-extrabold
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
            drop-shadow-[0_6px_25px_rgba(0,0,0,0.9)]
            tracking-wide
          "
        >
          The Art Of Stone
        </h1>

        <h2
          className="
            mt-3 text-white font-medium
            text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
            drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]
            tracking-wide
          "
        >
          Timeless Objects for Modern Homes
        </h2>
      </div>

      {/* 🎥 Video */}
      <video
        className="w-full h-[70vh] sm:h-[80vh] md:h-screen object-cover"
        src="/home.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero.jpeg"
      />
    </section>
  );
}
