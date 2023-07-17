/** This file exports the various model interfaces and types pertinent to the app. */

import { PhoneNumber } from "libphonenumber-js"

export interface ActivityModel {
  ID: string
  CreatedTimestampMillis: number
  Name: string
  Location?: LocationModel
  Faq?: FaqModel
  StartTimestampMillis: number
  EndTimestampMillis: number
  LastUpdatedTimestampMillis: number | null
}

export interface ChatGistModel {
  ChatID: string
  Participants: Array<UserInfo>
  LatestMessage: ChatMessageModel
  LastSeenMessageID?: number
  TypingUsers?: Array<UserInfo>
  DraftText?: string
}

export interface ChatMessageModel {
  MessageID: number
  Poster: UserInfo
  CreatedTimestampMillis: number
  Text?: string
}

export interface ChatModel {
  Gist: ChatGistModel
  Messages: Array<ChatMessageModel>
}

export interface ChatsSnapshot {
  Chats?: Array<ChatModel>
}

export interface ConnectionAddedModel {
  User: UserInfo
  IsConnected: boolean
}

export interface ConnectionsSnapshot {
  Invites: Array<InviteModel>
  Inviters: Array<UserInfo>
  Connections: Array<UserInfo>
  Incoming: Array<UserInfo>
  Outgoing: Array<UserInfo>
}

export interface ContactModel {
  Name: string
  Label: string
  PhoneNumber: PhoneNumber
}

export interface FaqModel {
  Topics: Array<FaqTopicModel>
}

export interface FaqTopicModel {
  Topic: string
  Question: string
  Answers: Array<string>
}

export interface ImageModel {
  ID: string
  CreatedTimestampMillis: number
  URL: string
}

export interface InviteModel {
  ID: string
  Name: string
  PhoneNumber: string
  CreatedTimestampMillis: number
  LastUpdatedTimestampMillis: number | null
}

export interface LocationModel {
  ID: string
  Name: string
  Address: string
  Latitude: number
  Longitude: number
}

export interface LoginContextModel {
  IsFirstLogin: boolean
  // Profile at the time of login. Use ProfileModelContext for more current profile.
  Profile: ProfileModel
  Credentials: {
    GoogleCloudApiKey: string
    OpenAIApiKey: string
  }
  ChatsSnapshot: ChatsSnapshot
  ConnectionsSnapshot: ConnectionsSnapshot
}

export interface ProfileModel {
  UserID: string
  PhoneNumber: string
  CreatedTimestampMillis: number
  Name: string | null
  EmailAddress: string | null
  Image: ImageModel | null
  LastUpdatedTimestampMillis: number | null
}

export interface DeviceContactsModel {
  Users?: Array<UserInfo>
}

// Note: Not serializable.
export interface UserApi {
  uid: string
  phoneNumber: string
  getIdToken: () => Promise<string>
  signOut: () => Promise<void>
}

export interface UserInfo {
  UserID: string
  Name?: string
  Image?: ImageModel
  PhoneNumber?: string
}