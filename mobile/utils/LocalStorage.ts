import AsyncStorage from '@react-native-async-storage/async-storage'

function getLocalUserDataKey(userID: string, type: string) {
  return `${userID}_${type}`
}

export async function loadLocalUserData<T>(userID: string, type: string, defaultValue: T): Promise<T> {
  return AsyncStorage.getItem(getLocalUserDataKey(userID, type))
    .then((payload) => {
      if (!payload) {
        return defaultValue
      }
      return JSON.parse(payload)
    })
    .catch(console.error)
}

export async function saveLocalUserData<T>(userID: string, type: string, data: T): Promise<void> {
  return AsyncStorage.setItem(getLocalUserDataKey(userID, type), JSON.stringify(data))
    .catch(console.error)
}

export async function clearLocalUserData(userID: string, type: string): Promise<void> {
  return AsyncStorage.removeItem(getLocalUserDataKey(userID, type))
}