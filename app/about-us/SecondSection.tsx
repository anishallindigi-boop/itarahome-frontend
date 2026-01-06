export default function SecondSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          className="
            relative overflow-hidden
            bg-[url('/hero.jpeg')]
            bg-contain bg-center bg-no-repeat bg-fixed
            min-h-[400px] md:min-h-[650px]
            flex items-center justify-center
          "
        >
          {/* White content box */}
          <div className="text-center bg-white/95 max-w-2xl p-6 md:p-12">
            <p className="text-sm tracking-widest text-gray-600 mb-4">
        Itara Home
            </p>
            <h2 className="text-3xl md:text-5xl font-light mb-6">
              About Itara Home
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
         Itara Home is a design-led home décor brand focused on creating modern, minimal and thoughtfully crafted stone products. We believe your space should feel calm, beautiful and intentional. That’s why our pieces are made using natural stone, each one slightly different from the next – just like the homes and people they belong to.
            </p>
           <a href="/contact">
            <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition">
        contact us
            </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
