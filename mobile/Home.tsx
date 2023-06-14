import { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Banner, Modal, Portal, SegmentedButtons, Snackbar } from 'react-native-paper'
import { FrontendServiceContext, UserApiContext } from './Contexts'
import { Page, Section } from './Layouts'
import MyActivities from './MyActivities'
import { MyFriends } from './MyFriends'
import Profile from './Profile'
import styles from './Styles'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { addIncomingConnection } from './redux/MyFriendsSlice'
import { setProfile } from './redux/ProfileSlice'
import { getDeviceToken, subscribeBackgroundListener, subscribeForegroundListener } from './utils/MessagingUtils'

const Home = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const loginContext = useAppSelector((state) => state.LoginSlice.loginContext!)
  const profile = useAppSelector((state) => state.ProfileSlice.profile!)

  const userApi = useContext(UserApiContext)!
  const frontendService = useContext(FrontendServiceContext)!

  const [error, setError] = useState<string>()

  /** Dispatches incoming remote messages. */
  function handleRemoteMessageInForeground(message: FirebaseMessagingTypes.RemoteMessage): void {
    message.data && Object.entries(message.data).forEach(([key, value]) => dispatchRemoteMessageData(key, value))
  }

  function dispatchRemoteMessageData(key: string, payload: string): void {
    const payloadJson = JSON.parse(payload)
    if (!!payload && !payloadJson) {
      console.error(`Error parsing remote message payload with key ${key}`)
      return
    }
    switch (key) {
      case 'ConnectionAdded':
        dispatch(addIncomingConnection(payloadJson))
        break
      default:
        console.error(`Unhandled remote message payload with key ${key}`)
    }
  }

  function handleRemoteMessageInBackground(message: FirebaseMessagingTypes.RemoteMessage): Promise<any> {
    console.error(`Unhandled background notification: ${JSON.stringify(message)}`)
    return Promise.resolve()
  }

  async function startReceivingRemoteMessages() {
    const token = await getDeviceToken()
    await frontendService.refreshDeviceToken(token)
    // TODO: Listen for token refreshes. See https://rnfirebase.io/reference/messaging#onTokenRefresh
    if (token) {
      subscribeForegroundListener(handleRemoteMessageInForeground) // the returned unsubscribe function is currently unused.
      subscribeBackgroundListener(handleRemoteMessageInBackground)
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

  const [tab, setTab] = React.useState('MyActivities')

  return (
    <Portal.Host>
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
                  { label: 'Activities', value: 'MyActivities' },
                  { label: 'Friends', value: 'MyFriends' },
                ]}
                style={{ marginBottom: 12 }}
              />
              {tab === 'MyActivities' &&
                <MyActivities />
              }
              {tab === 'MyFriends' &&
                <MyFriends />
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