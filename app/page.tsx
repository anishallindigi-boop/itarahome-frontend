import Homepage from './home/Home'


const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

/* ✅ DEFAULT SEO (FALLBACK) */
export const defaultSEO = {
  title: "Itara Home | Premium Home Decor & Lifestyle Products",
  description:
    "Discover Itara Home's curated collection of premium home decor, furniture, and lifestyle products. Transform your living spaces with our elegant, modern, and sustainable designs.",
  keywords: "Itara Home, home decor, furniture, interior design, lifestyle products, home accessories, modern decor, sustainable home goods",
  canonical: "https://itarahome.com",
  ogImage: "https://itarahome.com/og-image.jpg",
  twitterHandle: "@itarahome",
  siteName: "Itara Home",
  locale: "en_US",
  type: "website",
};

export async function generateMetadata() {
  const slug = "home";

  try {
    const res = await fetch(`${API_URL}/api/seo/get/${slug}`, {
      headers: {
        "x-api-key": API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("SEO API failed");

    const seo = await res.json();
    const data = seo?.data;

    return {
      title: data?.title || defaultSEO.title,
      description: data?.description || defaultSEO.description,
      keywords: data?.keywords || defaultSEO.keywords,
      robots: data?.noIndex ? "noindex, nofollow" : "index, follow",
      alternates: {
        canonical: data?.canonicalUrl || defaultSEO.canonical,
      },
      openGraph: {
        title: data?.ogTitle || data?.title || defaultSEO.title,
        description:
          data?.ogDescription || data?.description || defaultSEO.description,
        images: [
          {
            url: data?.ogImage || defaultSEO.ogImage,
            width: 1200,
            height: 630,
            alt: data?.title || defaultSEO.title,
          },
        ],
      },
      icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
      },
    };
  } catch (error) {
    // 🚨 API DOWN → USE FALLBACK SEO
    return {
      title: defaultSEO.title,
      description: defaultSEO.description,
      keywords: defaultSEO.keywords,
      robots: "index, follow",
      alternates: {
        canonical: defaultSEO.canonical,
      },
      openGraph: {
        title: defaultSEO.title,
        description: defaultSEO.description,
        images: [
          {
            url: defaultSEO.ogImage,
            width: 1200,
            height: 630,
            alt: defaultSEO.title,
          },
        ],
      },
      icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
      },
    };
  }
}



export default function Home() {
  return (
    <>
    <Homepage />
  
    </>
  );
}
