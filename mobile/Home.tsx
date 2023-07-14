import { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Banner, Modal, Portal, SegmentedButtons, Snackbar } from 'react-native-paper'
import { FrontendServiceContext, UserApiContext } from './Contexts'
import { Page, Section } from './Layouts'
import { ChatModel, ConnectionAddedModel } from './Models'
import MyActivities from './MyActivities'
import { MyChats } from './MyChats'
import { MyConnections } from './MyConnections'
import { DeviceContacts } from './MyDeviceContacts'
import Profile from './Profile'
import styles from './Styles'
import AppStateListener from './components/AppStateListener'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { incorporateChat } from './redux/MyChatsSlice'
import { addIncomingConnection } from './redux/MyConnectionsSlice'
import { setProfile } from './redux/ProfileSlice'
import { clearLocalUserData, loadLocalUserData, saveLocalUserData } from './utils/LocalStorage'
import { getDeviceToken, subscribeBackgroundListener, subscribeForegroundListener } from './utils/MessagingUtils'

const Home = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const loginContext = useAppSelector((state) => state.LoginSlice.loginContext!)
  const profile = useAppSelector((state) => state.ProfileSlice.profile!)

  const userApi = useContext(UserApiContext)!
  const frontendService = useContext(FrontendServiceContext)!

  const [error, setError] = useState<string>()

  /** Handles incoming remote messages when app is in foreground. */
  function handleRemoteMessageInForeground(message: FirebaseMessagingTypes.RemoteMessage): void {
    conditionallyDispatch<ConnectionAddedModel>(message, 'ConnectionAdded', (payload) => dispatch(addIncomingConnection(payload)))
    conditionallyDispatch<ChatModel>(message, 'ChatMessagePosted', (payload) => dispatch(incorporateChat(payload)))
  }

  function conditionallyDispatch<T>(message: FirebaseMessagingTypes.RemoteMessage, key: string, dispatcher: (payload: T) => void) {
    const payload = message.data && message.data[key] || undefined
    const json: T = payload && JSON.parse(payload) || undefined
    json && dispatcher(json)
  }

  /** Stores incoming remote messages to local storage when app is in background. */
  function storeRemoteMessageInBackground(message: FirebaseMessagingTypes.RemoteMessage): Promise<any> {
    const userID = userApi.uid
    const userDataType = 'RemoteMessages'
    const defaultValue: Array<FirebaseMessagingTypes.RemoteMessage> = []
    return loadLocalUserData(userID, userDataType, defaultValue)
      .then((messages) => saveLocalUserData(userID, userDataType, [...messages, message]))
      .catch(setError)
  }

  /** Consumes any remote messages persisted to local storage while app was in background. */
  async function processRemoteMessagesOnLocalStorage(): Promise<any> {
    const userID = userApi.uid
    const userDataType = 'RemoteMessages'
    const defaultValue: Array<FirebaseMessagingTypes.RemoteMessage> = []
    return loadLocalUserData(userID, userDataType, defaultValue)
      .then((messages) => messages.forEach(handleRemoteMessageInForeground))
      .then(() => clearLocalUserData(userID, userDataType))
      .catch(setError)
  }

  async function startReceivingRemoteMessages() {
    const token = await getDeviceToken()
    await frontendService.refreshDeviceToken(token)
    // TODO: Listen for token refreshes. See https://rnfirebase.io/reference/messaging#onTokenRefresh
    if (token) {
      subscribeForegroundListener(handleRemoteMessageInForeground) // the returned unsubscribe function is currently unused.
      subscribeBackgroundListener(storeRemoteMessageInBackground)
    } else {
      setError('Real-time features are disabled.')
      setShowMessagingPermissionsBanner(true)
    }
  }

  // Enable Messaging With APNS.
  const [showMessagingPermissionsBanner, setShowMessagingPermissionsBanner] = useState(false)
  useEffect(() => {
    startReceivingRemoteMessages()
  }, [] /* Only on first render */)

  // Profile Management.
  const [isEditingProfile, setEditingProfile] = useState(loginContext.IsFirstLogin)
  const [showIncompleteProfileBanner, setShowIncompleteProfileBanner] = useState(false)
  useEffect(() => setShowIncompleteProfileBanner(!profile.Name || !profile.Image), [profile])

  const [tab, setTab] = React.useState('MyChats')

  return (
    <Portal.Host>
      <AppStateListener onForeground={processRemoteMessagesOnLocalStorage} />
      <Page>
        <Section
          title="Home"
          actions={[
            { label: 'Profile', icon: 'account', callback: () => setEditingProfile(true) },
            { label: 'Sign out', icon: 'logout', callback: () => userApi.signOut() },
          ]}
        >
          {/* Messaging Permissions Banner. */}
          <Banner
            visible={showMessagingPermissionsBanner}
            elevation={4}
            style={{ marginBottom: 12 }}
            actions={[
              {
                label: 'Close',
                onPress: () => setShowMessagingPermissionsBanner(false),
              },
              {
                label: 'Fix it',
                onPress: startReceivingRemoteMessages,
              },
            ]}
            icon="alert-circle-outline">
            Grant notification permissions to enable real-time features.
          </Banner>

          {/* Incomplete Profile Banner. */}
          <Banner
            visible={showIncompleteProfileBanner}
            elevation={4}
            style={{ marginBottom: 12 }}
            actions={[
              {
                label: 'Close',
                onPress: () => setShowIncompleteProfileBanner(false),
              },
              {
                label: 'Fix it',
                onPress: () => setEditingProfile(true),
              },
            ]}
            icon="alert-circle-outline">
            Your profile is incomplete. Please pick both a name and an avatar.
          </Banner>

          {!isEditingProfile &&
            <View style={{ flex: 1, flexGrow: 1 }}>
              <SegmentedButtons
                value={tab}
                onValueChange={setTab}
                buttons={[
                  { value: 'MyChats', label: 'Conversations' },
                  { value: 'MyActivities', label: 'Activities' },
                ]}
                style={{ marginBottom: 12 }}
              />
              {tab === 'MyChats' &&
                <MyChats />
              }
              {tab === 'MyActivities' &&
                <MyActivities />
              }
            </View>
          }
        </Section>
        <Portal>
          <Modal
            contentContainerStyle={styles.fullscreen}
            onDismiss={() => setEditingProfile(false)}
            visible={isEditingProfile}
          >
            <Profile
              save={(profile) => dispatch(setProfile(profile))}
              close={() => setEditingProfile(false)}
            />
          </Modal>
          <Snackbar
            duration={5_000}
            onDismiss={() => setError(undefined)}
            style={styles.snackbar}
            visible={!!error}
          >
            {error}
          </Snackbar>
        </Portal>
      </Page>
    </Portal.Host>
  )
}

export default Home