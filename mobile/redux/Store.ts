import { configureStore } from '@reduxjs/toolkit'
import DeviceContactsSlice from './DeviceContactsSlice'
import LoginSlice from './LoginSlice'
import MyActivitiesSlice from './MyActivitiesSlice'
import MyConnectionsSlice from './MyConnectionsSlice'
import ProfileSlice from './ProfileSlice'

export const store = configureStore({
  reducer: {
    DeviceContactsSlice,
    LoginSlice,
    MyActivitiesSlice,
    MyConnectionsSlice,
    ProfileSlice,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: { myFriends: MyFriendsState, ... }
export type AppDispatch = typeof store.dispatch