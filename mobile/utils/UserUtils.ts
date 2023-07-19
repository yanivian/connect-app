import { ProfileModel, UserInfo } from "../Models"
import { IsEqual, arrayFind, arrayRemove, arrayUpsert } from "./ArrayUtils"

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

export function profileToUser(profile: ProfileModel): UserInfo {
  return {
    UserID: profile.UserID,
    PhoneNumber: profile.PhoneNumber,
    Image: profile.Image || undefined,
    Name: profile.Name || undefined,
  }
}