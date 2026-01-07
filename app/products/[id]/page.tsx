import { Metadata } from 'next';
import axios from 'axios';
import ClientProduct from './ClientProduct';

const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

// Server-side SEO metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Use GET for fetching product by slug
    const res = await axios.get(`${IMAGE_URL}/api/product/getBySlug/${params.id}`, {
      headers: { 'x-api-key': API_KEY },
    });

    const product = res.data.product;

    return {
      title: product.metatitle || product.name,
      description: product.metadescription || product.description,
      keywords: product.metakeywords || product.name.split(' ').join(', '),
      // openGraph: {
      //   title: product.metatitle || product.name,
      //   description: product.metadescription || product.description,
      //   images: [{ url: `${IMAGE_URL}${product.mainImage}` }],
      //   type: 'product',
      // },
      twitter: {
        card: 'summary_large_image',
        title: product.metatitle || product.name,
        description: product.metadescription || product.description,
        images: [`${IMAGE_URL}${product.mainImage}`],
      },
    };
  } catch (err) {
    // console.error('SEO fetch error:', err);
    return {
      title: 'Product',
      description: 'Product details',
    };
  }
}

// Render Client Component for interactivity
export default function Page({ params }: { params: { id: string } }) {
  return <ClientProduct slug={params.id} />;
}
