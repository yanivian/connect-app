import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ChatModel, ChatsSnapshot } from '../Models'
import { addOrReplaceChatMessageIn, getChatMessageIn } from '../utils/ChatMessageUtils'
import { addOrReplaceChatIn, getChatIn } from '../utils/ChatUtils'
import { compareChatGists, compareChatMessages } from '../utils/CompareUtils'

const initialState: ChatsSnapshot = {
  // TODO: Chats are not ordered deterministically.
  Chats: undefined,
}

export const MyChatsSlice = createSlice({
  name: 'MyChats',
  initialState,
  reducers: {
    refreshChats: (state, action: PayloadAction<ChatsSnapshot>) => {
      Object.assign(state, { ...initialState, ...action.payload })
    },
    incorporateChat: (state, action: PayloadAction<ChatModel>) => {
      const chat = action.payload
      let list = state.Chats || []
      const existingChat = getChatIn(chat, list)

      let messages = existingChat?.Messages || []
      chat.Messages.forEach((message) => {
        const existingMessage = getChatMessageIn(message, messages)
        if (!existingMessage || compareChatMessages(existingMessage, message) >= 0) {
          messages = addOrReplaceChatMessageIn(message, messages).sort(compareChatMessages)
        } else {
          console.debug(`Incoming message deemed out-of-date: ${JSON.stringify(message)}`)
        }
      })

      let gist = chat.Gist
      if (existingChat && compareChatGists(existingChat.Gist, gist) > 0) {
        console.debug(`Incoming gist deemed out-of-date: ${JSON.stringify(gist)}`)
        gist = existingChat.Gist
      }

      const updatedChat: ChatModel = {
        Gist: gist,
        Messages: messages,
      }
      state.Chats = addOrReplaceChatIn(updatedChat, list)
    },
  },
})

export const { refreshChats, incorporateChat } = MyChatsSlice.actions

export default MyChatsSlice.reducer