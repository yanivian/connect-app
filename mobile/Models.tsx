/** This file exports the various model interfaces and types pertinent to the app. */

export interface ActivityModel {
  ID: string
  CreatedTimestampMillis: number
  Name: string
  Location?: LocationModel
  StartTimestampMillis: number
  EndTimestampMillis: number
  LastUpdatedTimestampMillis: number | null
}

export interface FaqModel {
  Questions: Array<{
    Topic: string
    Question: string
    Answers: Array<string>
  }>
}
export interface ImageModel {
  ID: string
  CreatedTimestampMillis: number
  URL: string
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
  Profile: ProfileModel
  Credentials: {
    GoogleCloudApiKey: string,
    OpenAIApiKey: string,
  }
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

export interface UserModel {
  uid: string
  phoneNumber: string
  getIdToken: () => Promise<string>
  signOut: () => Promise<void>
}
