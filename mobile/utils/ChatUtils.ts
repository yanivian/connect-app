import { ChatModel, UserInfo } from "../Models"
import { IsEqual, arrayFind, arrayRemove, arrayUpsert } from "./ArrayUtils"

const isSameChat: IsEqual<ChatModel> = (x: ChatModel, y: ChatModel) => {
  return x.Gist.ChatID === y.Gist.ChatID
}

export function isChatIn(chat: ChatModel, list: Array<ChatModel>): boolean {
  return arrayFind(chat, list, isSameChat).length > 0
}

export function getChatIn(chat: ChatModel, list: Array<ChatModel>): ChatModel | undefined {
  const matches = arrayFind(chat, list, isSameChat)
  return matches && matches[0]
}

export function removeChatFrom(chat: ChatModel, list: Array<ChatModel>): Array<ChatModel> {
  return arrayRemove(chat, list, isSameChat)
}

export function addOrReplaceChatIn(chat: ChatModel, list: Array<ChatModel>): Array<ChatModel> {
  return arrayUpsert(chat, list, isSameChat)
}

export function summarizeParticipants(otherParticipants: Array<UserInfo>): string {
  if (!otherParticipants) {
    return '(Just You)'
  }
  const names = otherParticipants.map((p) => p.Name || p.PhoneNumber || 'Anonymous')
  switch (names.length) {
    case 1:
      return names[0]
    case 2:
      return `${names[0]} and ${names[1]}`
    case 3:
      return `${names[0]}, ${names[1]} and ${names[2]}`
    default:
      return `${names[0]} and ${names.length - 1} others`
  }
}

// At least one user must be typing.
export function summarizeTypingUsers(typingUsers: Array<UserInfo>, thisUserID: string): string {
  const others = typingUsers.filter((u) => u.UserID !== thisUserID)
  const names = others.map((u) => u.Name || u.PhoneNumber || 'Anonymous')
  if (others.length < typingUsers.length) {
    // This user is also typing.
    switch (names.length) {
      case 0:
        return 'You are typing.'
      case 1:
        return `You and ${names[0]} are typing.`
      case 2:
        return `You, ${names[0]} and ${names[1]} are typing.`
      default:
        return `You and ${names.length} others are typing.`
    }
  }
  switch (names.length) {
    case 1:
      return `${names[0]} is typing.`
    case 2:
      return `${names[0]} and ${names[1]} are typing.`
    case 3:
      return `${names[0]}, ${names[1]} and ${names[2]} are typing.`
    default:
      return `${names[0]} and ${names.length - 1} others are typing.`
  }
}

export function pickParticipantForAvatarCard(otherParticipants: Array<UserInfo>, thisUser: UserInfo): UserInfo {
  const otherParticipantsWithAvatars = otherParticipants.filter((p) => !!p.Image)
  if (otherParticipantsWithAvatars.length > 0) {
    return otherParticipantsWithAvatars[0]
  }
  if (otherParticipants.length > 0) {
    return otherParticipants[0]
  }
  return thisUser
}