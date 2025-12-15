import { configureStore, Middleware, UnknownAction } from '@reduxjs/toolkit';
import AuthSlice from './slice/AuthSlice';
import ProductCategorySlice from './slice/ProductCategorySlice';
import ProductSlice from './slice/ProductSlice';
import CartItemSlice from './slice/CartItemSlice';
import  ShippingMethodSlice from './slice/ShippingMethodSlice';
import OrderSlice from './slice/OrderSlice';

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    productcategory: ProductCategorySlice,
    product: ProductSlice,
    usercart: CartItemSlice,
    shippingmethod:ShippingMethodSlice,
    order:OrderSlice
  },

})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Define the middleware type
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store