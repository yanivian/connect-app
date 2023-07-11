import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ChatsSnapshot } from '../Models'

export const initialState: ChatsSnapshot = {
  Chats: undefined,
}

export const MyChatsSlice = createSlice({
  name: 'MyChats',
  initialState,
  reducers: {
    refresh: (state, action: PayloadAction<ChatsSnapshot>) => {
      Object.assign(state, { ...initialState, ...action.payload })
    },
  },
})

export const { refresh } = MyChatsSlice.actions

export default MyChatsSlice.reducer