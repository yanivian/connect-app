import { PermissionsAndroid, Platform } from 'react-native'
import Contacts, { requestPermission } from 'react-native-contacts'

export const ERROR_CONTACTS_PERMISSION_NOT_GRANTED = 'ERROR_CONTACTS_PERMISSION_NOT_GRANTED'

export async function fetchContacts(): Promise<Array<Contacts.Contact>> {
  const os = Platform.OS
  if (os === 'android') {
    return fetchContacts_Android()
  }
  if (os === 'ios') {
    return fetchContacts_iOS()
  }
  return Promise.reject(`Contacts not available for ${Platform.OS}`)
}

async function fetchContacts_Android(): Promise<Array<Contacts.Contact>> {
  return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
    .then((status) => {
      if (status !== 'granted') {
        return Promise.reject(ERROR_CONTACTS_PERMISSION_NOT_GRANTED)
      }
      return Contacts.getAllWithoutPhotos()
    })
}

async function fetchContacts_iOS(): Promise<Array<Contacts.Contact>> {
  return requestPermission()
    .then((permission) => {
      if (permission !== 'authorized') {
        return Promise.reject(ERROR_CONTACTS_PERMISSION_NOT_GRANTED)
      }
      return Contacts.getAllWithoutPhotos()
    })
}