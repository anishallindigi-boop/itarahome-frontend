import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface CartItem {
  _id: string;
  productId: {
    name: string;
    mainImage: string;
    price: number;
    discountPrice?: number;
  };
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
}



export const categoryApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include', // for cart session
    prepareHeaders: (headers) => {
      headers.set('x-api-key', API_KEY || '');
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ✅ FIXED PATH
    getCategories: builder.query<any, void>({
      query: () => '/api/category/all',
    }),

    // ✅ this one was already correct
    getSubCategories: builder.query<any, void>({
      query: () => '/api/subcategory/get',
    }),

    //cart
getCartItems: builder.query<any, void>({
  query: () => '/api/cart/get',
  keepUnusedDataFor: 0,

}),



  }),
});

export const {
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetCartItemsQuery
} = categoryApi;