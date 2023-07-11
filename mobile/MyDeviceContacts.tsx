import parsePhoneNumber, { NumberType } from 'libphonenumber-js'
import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Button, Card, Portal, Snackbar, Text } from 'react-native-paper'
import { FrontendServiceContext, UserApiContext } from './Contexts'
import { LoadingAnimation } from './Layouts'
import { DeviceContactsModel } from './Models'
import styles from './Styles'
import ConnectionCard from './components/ConnectionCard'
import { refresh } from './redux/DeviceContactsSlice'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { ERROR_CONTACTS_PERMISSION_NOT_GRANTED, fetchContacts } from './utils/ContactsUtils'
import { loadLocalUserData, saveLocalUserData } from './utils/LocalStorage'

const ALLOWED_PHONE_NUMBER_TYPES = new Set<NumberType>(['FIXED_LINE_OR_MOBILE', 'MOBILE'])

export const DeviceContacts = (): JSX.Element => {
  const myPhoneNumber = useContext(UserApiContext)!.phoneNumber
  const frontendService = useContext(FrontendServiceContext)!
  const userID = frontendService.getUserID()!

  const deviceContacts = useAppSelector((state) => state.DeviceContactsSlice)
  const dispatch = useAppDispatch()

  const [error, setError] = useState<string>()
  const [refreshing, setRefreshing] = useState(true)

  // Load from local storage.
  useEffect(() => {
    (async () => {
      const loadedDeviceContacts = await loadLocalUserData(userID, 'DeviceContacts', {} as DeviceContactsModel)
      // Explicitly refresh contacts to capture any profile changes, deletions, etc.
      const userIDs = (loadedDeviceContacts.Users || []).map((user) => user.UserID)
      if (!!userIDs) {
        const refreshedDeviceContacts = await frontendService.syncDeviceContacts({ UserIDs: userIDs })
        dispatch(refresh(refreshedDeviceContacts))
      }
      setRefreshing(false)
    })()
  }, [])

  // Save to local storage.
  // TODO: Use checksum to avoid redundant saves.
  useEffect(() => {
    (async () => {
      await saveLocalUserData(userID, 'DeviceContacts', deviceContacts).catch(setError)
    })()
  }, [deviceContacts])

  async function syncDeviceContacts(): Promise<any> {
    setRefreshing(true)
    return fetchContacts()
      .then((contacts) => {
        const phoneNumbers = new Set<string>()
        for (const contact of contacts) {
          for (const phoneNumberRecord of contact.phoneNumbers) {
            const phoneNumber = parsePhoneNumber(phoneNumberRecord.number, 'US')
            if (phoneNumber && phoneNumber.isValid()
              && phoneNumber.country === 'US'
              && ALLOWED_PHONE_NUMBER_TYPES.has(phoneNumber.getType())
              && phoneNumber.number !== myPhoneNumber) {
              phoneNumbers.add(phoneNumber.number)
            }
          }
        }
        return frontendService.syncDeviceContacts({ PhoneNumbers: Array.from(phoneNumbers) })
      }).then((result) => dispatch(refresh(result)))
      .catch((err) => {
        if (err === ERROR_CONTACTS_PERMISSION_NOT_GRANTED) {
          // User has declined access to their contacts.
          return
        }
        setError(err)
      })
      .finally(() => setRefreshing(false))
  }

  return (
    <ScrollView style={{ flex: 1, flexGrow: 1 }}>

      <Card
        mode='outlined'
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <Card.Content>
          {!deviceContacts.Users &&
            <Text style={{ textAlign: 'center' }} variant="bodyLarge">
              Sync contacts from your device to connect with them.
            </Text>
          }
          {
            !!deviceContacts.Users && deviceContacts.Users.map((user) => {
              return (
                <ConnectionCard
                  key={user.UserID}
                  user={user}
                />
              )
            })
          }
        </Card.Content>
      </Card>

      <View
        style={{ paddingTop: 12, flexDirection: 'row', justifyContent: 'center' }}
      >
        <Button
          mode='contained-tonal'
          icon='delete'
          onPress={() => dispatch(refresh({}))}
        >
          Clear
        </Button>
        <View style={{ width: 6 }} />
        <Button
          mode='contained'
          icon='sync'
          onPress={syncDeviceContacts}
        >
          Sync
        </Button>
      </View>

      {refreshing && <LoadingAnimation />}

      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </ScrollView>
  )
}