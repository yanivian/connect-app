import { ChatMessageModel } from "../Models"
import { IsEqual, arrayFind, arrayRemove, arrayUpsert } from "./ArrayUtils"

const isSameChatMessage: IsEqual<ChatMessageModel> = (x: ChatMessageModel, y: ChatMessageModel) => {
  return x.MessageID === y.MessageID
}

export function isChatMessageIn(chat: ChatMessageModel, list: Array<ChatMessageModel>): boolean {
  return arrayFind(chat, list, isSameChatMessage).length > 0
}

export function getChatMessageIn(chat: ChatMessageModel, list: Array<ChatMessageModel>): ChatMessageModel | undefined {
  const matches = arrayFind(chat, list, isSameChatMessage)
  return matches && matches[0]
}

export function removeChatMessageFrom(chat: ChatMessageModel, list: Array<ChatMessageModel>): Array<ChatMessageModel> {
  return arrayRemove(chat, list, isSameChatMessage)
}

export function addOrReplaceChatMessageIn(chat: ChatMessageModel, list: Array<ChatMessageModel>): Array<ChatMessageModel> {
  return arrayUpsert(chat, list, isSameChatMessage)
}

export function summarizePoster(message: ChatMessageModel, userID: string, numOtherParticipants: number) {
  if (userID === message.Poster.UserID) {
    return 'You'
  }
  if (numOtherParticipants === 1) {
    return 'They'
  }
  return message.Poster.Name || message.Poster.PhoneNumber || 'Anonymous'
}