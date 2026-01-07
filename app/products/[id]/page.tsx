import { Metadata } from 'next';
import axios from 'axios';
import ClientProduct from './ClientProduct';

const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

// Server-side SEO metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params; // destructure first

  try {
    const res = await axios.get(`${IMAGE_URL}/api/product/getBySlug/${id}`, {
      headers: { 'x-api-key': API_KEY },
    });

  
    const product = res.data.product;

    return {
      title: product.metatitle?.trim() || product.name || 'Product',
      description: product.metadescription?.trim() || product.description || 'Product details',
      keywords: product.metakeywords?.trim() || (product.name ? product.name.split(' ').join(', ') : ''),
      twitter: {
        card: 'summary_large_image',
        title: product.metatitle?.trim() || product.name || 'Product',
        description: product.metadescription?.trim() || product.description || 'Product details',
        images: [`${IMAGE_URL}${product.mainImage}`],
      },
    };
  } catch (err) {
   
    return {
      title: 'Product',
      description: 'Product details',
    };
  }
}

// Render client component
export default function Page({ params }: { params: { id: string } }) {
  const slug = params.id; // destructure here
  return <ClientProduct slug={slug} />;
}
