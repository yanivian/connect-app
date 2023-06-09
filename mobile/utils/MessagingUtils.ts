import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { PermissionsAndroid, Platform } from 'react-native'

export const ERROR_MESSAGING_PERMISSION_NOT_GRANTED = 'ERROR_MESSAGING_PERMISSION_NOT_GRANTED'

export async function checkMessagingEnabled(): Promise<void> {
  const os = Platform.OS
  if (os === 'android') {
    return checkMessagingEnabled_Android()
  }
  if (os === 'ios') {
    return checkMessagingEnabled_iOS()
  }
  return Promise.reject(`Messaging not available for ${Platform.OS}`)
}

async function checkMessagingEnabled_Android(): Promise<void> {
  return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
    .then((status) => {
      if (status !== 'granted') {
        return Promise.reject(ERROR_MESSAGING_PERMISSION_NOT_GRANTED)
      }
    })
}

async function checkMessagingEnabled_iOS(): Promise<void> {
  return messaging().requestPermission()
    .then((status) => {
      if (status != FirebaseMessagingTypes.AuthorizationStatus.AUTHORIZED) {
        return Promise.reject(ERROR_MESSAGING_PERMISSION_NOT_GRANTED)
      }
    })
}