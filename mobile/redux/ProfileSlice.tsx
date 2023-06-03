import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ProfileModel } from '../Models'

interface ProfileState {
  profile?: ProfileModel
}

const initialState: ProfileState = {}

export const ProfileSlice = createSlice({
  name: 'Login',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileModel>) => {
      state.profile = action.payload
    },
  },
})

export const { setProfile } = ProfileSlice.actions

export default ProfileSlice.reducer