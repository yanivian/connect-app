import messaging from '@react-native-firebase/messaging'
import { PermissionsAndroid, Platform } from 'react-native'

export async function getDeviceToken(): Promise<string | undefined> {
  return checkMessagingEnabled()
    .then((isEnabled) => isEnabled ? messaging().getToken() : undefined)
}

async function checkMessagingEnabled(): Promise<boolean> {
  const os = Platform.OS
  if (os === 'android') {
    return checkMessagingEnabled_Android()
  }
  if (os === 'ios') {
    return checkMessagingEnabled_iOS()
  }
  return Promise.reject(`Messaging not available for ${Platform.OS}`)
}

async function checkMessagingEnabled_Android(): Promise<boolean> {
  return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).then((status) => status === 'granted')
}

async function checkMessagingEnabled_iOS(): Promise<boolean> {
  return messaging().requestPermission()
    .then(async (status) => {
      const isEnabled = status == 1 /* AUTHORIZED */
      if (isEnabled && !messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages()
      }
      return isEnabled
    })
}