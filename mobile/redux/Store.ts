import { configureStore } from '@reduxjs/toolkit'
import LoginSlice from './LoginSlice'
import MyActivitiesSlice from './MyActivitiesSlice'
import MyFriendsSlice from './MyFriendsSlice'
import ProfileSlice from './ProfileSlice'

export const store = configureStore({
  reducer: {
    LoginSlice,
    MyActivitiesSlice,
    MyFriendsSlice,
    ProfileSlice,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: { myFriends: MyFriendsState, ... }
export type AppDispatch = typeof store.dispatch