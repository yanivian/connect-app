import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { InviteModel } from '../Models'

interface MyFriendsState {
  invites: Array<InviteModel>
}

const initialState: MyFriendsState = {
  invites: [],
}

export const MyFriendsSlice = createSlice({
  name: 'MyFriends',
  initialState,
  reducers: {
    addInvite: (state, action: PayloadAction<InviteModel>) => {
      state.invites = [
        action.payload,
        ...state.invites.filter((invite) => invite.ID !== action.payload.ID),
      ]
    },
    deleteInvite: (state, action: PayloadAction<InviteModel>) => {
      state.invites = state.invites.filter((invite) => invite.ID !== action.payload.ID)
    },
  },
})

export const { addInvite, deleteInvite } = MyFriendsSlice.actions

export default MyFriendsSlice.reducer