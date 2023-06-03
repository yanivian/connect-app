import { configureStore } from '@reduxjs/toolkit'
import loginSlice from './LoginSlice'
import myFriendsSlice from './MyFriendsSlice'
import profileSlice from './ProfileSlice'

export const store = configureStore({
  reducer: {
    loginSlice,
    myFriendsSlice,
    profileSlice,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: { myFriends: MyFriendsState, ... }
export type AppDispatch = typeof store.dispatch