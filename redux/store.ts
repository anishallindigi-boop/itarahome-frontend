import { configureStore, Middleware, UnknownAction } from '@reduxjs/toolkit';
import AuthSlice from './slice/AuthSlice';
import ProductCategorySlice from './slice/ProductCategorySlice';
import ProductSlice from './slice/ProductSlice';
import CartItemSlice from './slice/CartItemSlice';
import  ShippingMethodSlice from './slice/ShippingMethodSlice';
import OrderSlice from './slice/OrderSlice';
import  BlogCategorySlice  from './slice/BlogCategorySlice';
import BlogSlice from './slice/BlogSlice';
import  WishlistSlice  from './slice/WishlistSlice';
import VariationSlice from './slice/VariationSlice';
import ImageSlice from './slice/ImageSlice'

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    productcategory: ProductCategorySlice,
    product: ProductSlice,
    variation:VariationSlice,
    usercart: CartItemSlice,
    shippingmethod:ShippingMethodSlice,
    order:OrderSlice,
       blogcategory:BlogCategorySlice,
    blog:BlogSlice,
    wishlist:WishlistSlice,
    image: ImageSlice,
  },

})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Define the middleware type
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store