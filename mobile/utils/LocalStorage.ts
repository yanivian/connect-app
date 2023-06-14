import AsyncStorage from '@react-native-async-storage/async-storage'

function getLocalUserDataKey(userID: string, key: string) {
  return `@local.${key}.${userID}`
}

export async function loadLocalUserData<T>(userID: string, key: string, defaultValue: T): Promise<T> {
  return AsyncStorage.getItem(getLocalUserDataKey(userID, key))
    .then((payload) => !payload ? defaultValue : JSON.parse(payload))
}

export async function saveLocalUserData<T>(userID: string, key: string, data: T): Promise<void> {
  return AsyncStorage.setItem(getLocalUserDataKey(userID, key), JSON.stringify(data))
}