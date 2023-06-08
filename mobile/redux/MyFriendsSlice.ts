import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ConnectionsSnapshot, InviteModel, UserInfo } from '../Models'
import { IsEqual, arrayFind, arrayRemove, arrayUpsert } from '../utils/ArrayUtils'

export const initialState: ConnectionsSnapshot = {
  Invites: [],
  Inviters: [],
  Connections: [],
  Incoming: [],
  Outgoing: [],
}

const isSameUser: IsEqual<UserInfo> = (x: UserInfo, y: UserInfo) => {
  return x.UserID === y.UserID
}

export function isUserIn(user: UserInfo, list: Array<UserInfo>): boolean {
  return arrayFind(user, list, isSameUser).length > 0
}

export function removeUserFrom(user: UserInfo, list: Array<UserInfo>) {
  return arrayRemove(user, list, isSameUser)
}

export function addOrReplaceUserIn(user: UserInfo, list: Array<UserInfo>) {
  return arrayUpsert(user, list, isSameUser)
}

export const MyFriendsSlice = createSlice({
  name: 'MyFriends',
  initialState,
  reducers: {
    hydrate: (state, action: PayloadAction<ConnectionsSnapshot>) => {
      Object.assign(state, { ...initialState, ...action.payload })
    },
    addInvite: (state, action: PayloadAction<InviteModel>) => {
      state.Invites = [
        action.payload,
        ...state.Invites.filter((invite) => invite.ID !== action.payload.ID),
      ]
    },
    deleteInvite: (state, action: PayloadAction<InviteModel>) => {
      state.Invites = state.Invites.filter((invite) => invite.ID !== action.payload.ID)
    },
    addConnection: (state, action: PayloadAction<{ User: UserInfo, IsConnected: boolean }>) => {
      const user = action.payload.User
      const isConnected = action.payload.IsConnected
      if (isConnected) {
        state.Incoming = removeUserFrom(user, state.Incoming)
        state.Connections = addOrReplaceUserIn(user, state.Connections)
      } else {
        state.Outgoing = addOrReplaceUserIn(user, state.Outgoing)
      }
    },
  },
})

export const { hydrate, addInvite, deleteInvite, addConnection } = MyFriendsSlice.actions

export default MyFriendsSlice.reducer