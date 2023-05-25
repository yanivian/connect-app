import React, { useState } from 'react'
import { PermissionsAndroid, View } from 'react-native'
import Contacts from 'react-native-contacts'
import { FAB, Portal, Snackbar, Text } from 'react-native-paper'
import styles from './Styles'

const PERMISSION_NOT_GRANTED = 'NOT_GRANTED'

interface ContactModel {
  name: string
  phoneNumber: string
}

const MyFriends = (): JSX.Element => {
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [contacts, setContacts] = useState<Array<ContactModel>>()
  const [error, setError] = useState<string>()

  async function openContacts() {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
      .then((status) => {
        if (status !== 'granted') {
          return Promise.reject(PERMISSION_NOT_GRANTED)
        }
        return Contacts.getAllWithoutPhotos()
      }).then((contacts) => {
        const models: Array<ContactModel> = []
        for (const contact of contacts) {
          const name = contact.displayName || contact.givenName
          if (name) {
            for (const phoneNumberRecord of contact.phoneNumbers) {
              const phoneNumber = phoneNumberRecord.number
              if (phoneNumber) {
                models.push({ name, phoneNumber })
              }
            }
          }
        }
        setContacts(models)
      }).catch((err) => {
        if (err === PERMISSION_NOT_GRANTED) {
          // User has declined access to their contacts.
          return
        }
        setError(err)
      })
  }

  return (
    <View>
      <Text style={styles.text} variant="bodyLarge">
        This is where your friends will be shown. Invite someone to get started.
      </Text>
      <Portal>
        <FAB.Group
          actions={[
            {
              icon: 'phone',
              label: 'Phone Number',
              onPress: () => { },
            },
            {
              icon: 'contacts',
              label: 'Contact',
              onPress: openContacts,
            },
          ]}
          icon={isFabOpen ? 'minus' : 'plus'}
          onStateChange={({ open }) => setIsFabOpen(open)}
          open={isFabOpen}
          visible
        />
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </View>
  )
}

export default MyFriends