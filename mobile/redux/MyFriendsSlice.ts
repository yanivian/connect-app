import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ConnectionAddedModel, ConnectionsSnapshot, InviteModel } from '../Models'
import { addOrReplaceUserIn, removeUserFrom } from '../utils/UserUtils'

export const initialState: ConnectionsSnapshot = {
  Invites: [],
  Inviters: [],
  Connections: [],
  Incoming: [],
  Outgoing: [],
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
    addIncomingConnection: (state, action: PayloadAction<ConnectionAddedModel>) => {
      const user = action.payload.User
      const isConnected = action.payload.IsConnected
      if (isConnected) {
        state.Outgoing = removeUserFrom(user, state.Outgoing)
        state.Connections = addOrReplaceUserIn(user, state.Connections)
      } else {
        state.Incoming = addOrReplaceUserIn(user, state.Incoming)
      }
    },
    addOutgoingConnection: (state, action: PayloadAction<ConnectionAddedModel>) => {
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

export const { hydrate, addInvite, deleteInvite, addIncomingConnection, addOutgoingConnection } = MyFriendsSlice.actions

export default MyFriendsSlice.reducer