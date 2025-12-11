const articles = [
  {
    date: { day: '02', month: 'Nov' },
    image: 'https://images.pexels.com/photos/5603660/pexels-photo-5603660.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Event', 'Gallery'],
    title: 'Clay Week 20, an online conference event celebrating clay'
  },
  {
    date: { day: '02', month: 'Nov' },
    image: 'https://images.pexels.com/photos/6045179/pexels-photo-6045179.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Auction', 'Ceramic'],
    title: "Craft Contemporary's online ceramic auction, celebration"
  },
  {
    date: { day: '02', month: 'Nov' },
    image: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600',
    tags: ['Artist', 'Studio'],
    title: 'Cluster launches Crafts Artist Residency for Spring 2021'
  }
];

export default function Blog() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-gray-600 mb-4">OUR BLOG</p>
          <h2 className="text-5xl font-light">Articles About Pottery</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden mb-4">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white px-4 py-2 text-center">
                  <div className="text-2xl font-light">{article.date.day}</div>
                  <div className="text-xs text-gray-600">{article.date.month}</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                {article.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-900 text-white text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-light leading-relaxed group-hover:text-gray-600 transition">
                {article.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}