import { NumberType, parsePhoneNumber } from 'libphonenumber-js'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { ActivityIndicator, Button, Divider, Portal, Snackbar, useTheme } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Page, Section } from '../Layouts'
import { ChatModel, DeviceContactsModel, UserInfo } from '../Models'
import styles from '../Styles'
import DeviceContactCard, { DeviceContactCardProps } from '../components/DeviceContactCard'
import { refresh } from '../redux/DeviceContactsSlice'
import { useAppDispatch, useAppSelector } from '../redux/Hooks'
import { ERROR_CONTACTS_PERMISSION_NOT_GRANTED, fetchContacts } from '../utils/ContactsUtils'
import { loadLocalUserData, saveLocalUserData } from '../utils/LocalStorage'
import { addOrReplaceUserIn, isUserIn, removeUserFrom } from '../utils/UserUtils'

const ALLOWED_PHONE_NUMBER_TYPES = new Set<NumberType>(['FIXED_LINE_OR_MOBILE', 'MOBILE'])

export interface DeviceContactPickerPageProps {
  select: (user: Array<UserInfo> | undefined) => void
}

const { width } = Dimensions.get('window')

const DeviceContactCardViewTypes = {
  ROW: 1,
}

const deviceContactCardLayoutProvider = new LayoutProvider(
  (index) => DeviceContactCardViewTypes.ROW,
  (type, dim) => {
    switch (type) {
      case DeviceContactCardViewTypes.ROW:
        dim.width = width
        dim.height = 62
        break;
      default:
        dim.width = 0
        dim.height = 0
    }
  }
)

const dataProvider = new DataProvider((r1, r2: any) => r1 !== r2)

function findChatByID(chatID: string, list: Array<ChatModel>): ChatModel | undefined {
  const matches = list.filter((c) => c.Gist.ChatID === chatID)
  return matches && matches[0]
}

export function DeviceContactPickerPage(props: DeviceContactPickerPageProps): JSX.Element {
  const myPhoneNumber = useContext(UserApiContext)!.phoneNumber
  const userApi = useContext(UserApiContext)!
  const frontendService = useContext(FrontendServiceContext)!
  const theme = useTheme()

  const deviceContacts = useAppSelector((state) => state.DeviceContactsSlice)
  const dispatch = useAppDispatch()

  const [error, setError] = useState<string>()
  const [refreshing, setRefreshing] = useState(true)

  // Load from local storage.
  useEffect(() => {
    (async () => {
      const loadedDeviceContacts = await loadLocalUserData(userApi.uid, 'DeviceContacts', {} as DeviceContactsModel)
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
      await saveLocalUserData(userApi.uid, 'DeviceContacts', deviceContacts).catch(setError)
    })()
  }, [deviceContacts])

  function clearDeviceContacts() {
    setSelectedUsers([])
    dispatch(refresh({}))
  }

  async function syncDeviceContacts(): Promise<any> {
    setRefreshing(true)
    return fetchContacts()
      .then((contacts) => {
        const phoneNumbers = new Set<string>()
        for (const contact of contacts) {
          for (const phoneNumberRecord of contact.phoneNumbers) {
            let phoneNumber
            try {
              phoneNumber = parsePhoneNumber(phoneNumberRecord.number, 'US')
            } catch (e) {
              console.debug(`Could not parse ${phoneNumberRecord.number} as a phone number: ${e}`)
            }
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

  const [selectedUsers, setSelectedUsers] = useState<Array<UserInfo>>([])

  const toggleSelectUser = useCallback((user: UserInfo) => {
    if (isUserIn(user, selectedUsers)) {
      setSelectedUsers(removeUserFrom(user, selectedUsers))
    } else {
      setSelectedUsers(addOrReplaceUserIn(user, selectedUsers))
    }
  }, [selectedUsers])

  const getDeviceContacts = useCallback(() => {
    if (!deviceContacts.Users) {
      return []
    }
    return deviceContacts.Users.map((user) => {
      return {
        user,
        isSelected: isUserIn(user, selectedUsers),
      } as DeviceContactCardProps
    })
  }, [deviceContacts, selectedUsers])

  const [deviceContactsDataProvider, setDeviceContactsDataProvider] = useState(dataProvider.cloneWithRows(getDeviceContacts()))
  const deviceContactCardRenderer = (type: string | number, props: DeviceContactCardProps, index: number) => {
    switch (type) {
      case DeviceContactCardViewTypes.ROW:
        return (
          <DeviceContactCard
            key={props.user.UserID}
            {...props}
            toggleSelect={() => toggleSelectUser(props.user)}
          />
        )
      default:
        return null
    }
  }

  // Refresh the data provider when device contacts change.
  useEffect(() => {
    setDeviceContactsDataProvider(dataProvider.cloneWithRows(getDeviceContacts()))
  }, [deviceContacts, selectedUsers])

  return (
    <Page>
      <Section
        title='Contacts'
        actions={[{
          label: 'Close',
          icon: 'close',
          callback: () => props.select(undefined),
        }]}
      >
        <View style={{
          flex: 1,
          flexGrow: 1,
          backgroundColor: 'transparent',
        }}>
          <RecyclerListView
            layoutProvider={deviceContactCardLayoutProvider}
            dataProvider={deviceContactsDataProvider}
            rowRenderer={deviceContactCardRenderer}
          />
          {refreshing &&
            <ActivityIndicator
              animating={true}
              size='small'
              style={{ paddingVertical: 12 }}
            />
          }
          <Divider />
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginVertical: 12,
          }}>
            <Button
              mode='contained-tonal'
              icon='delete'
              onPress={clearDeviceContacts}
            >
              Clear
            </Button>
            <View style={{ width: 6 }} />
            <Button
              mode='contained-tonal'
              icon='sync'
              onPress={syncDeviceContacts}
            >
              Sync
            </Button>
            <View style={{ width: 6 }} />
            <Button
              mode='contained'
              onPress={() => props.select(selectedUsers)}
              disabled={selectedUsers.length === 0}
            >
              Next
            </Button>
          </View>
        </View>
      </Section>
      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </Page>
  )
}