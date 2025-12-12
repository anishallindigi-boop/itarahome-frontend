import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from './slice/AuthSlice';
import ProductCategorySlice from './slice/ProductCategorySlice';
import ProductSlice from './slice/ProductSlice';
import CartItemSlice  from './slice/CartItemSlice';

const store = configureStore({
  reducer: {
  auth:AuthSlice,
  productcategory:ProductCategorySlice,
  product:ProductSlice,
  usercart:CartItemSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store