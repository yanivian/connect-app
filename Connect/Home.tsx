import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Banner, Button, FAB, Portal, Text } from 'react-native-paper'
import { ProfileModelContext, UserModelContext } from './Contexts'
import { Page, Section } from './Layouts'
import Profile from './Profile'
import styles from './Styles'

enum Route {
  Home,
  Profile,
}

const Home = (): JSX.Element => {
  const user = useContext(UserModelContext)!
  const initProfile = useContext(ProfileModelContext)!

  // State with which to override the profile available to its children.
  const [profile, setProfile] = useState(initProfile)
  const isProfileComplete = !!profile.Name && !!profile.Image

  // State capturing whether the banner for incomplete profile should be shown.
  const [showIncompleteProfileBanner, setShowIncompleteProfileBanner] = useState(false)
  // State capturing whether the Add (+) button panel is open.
  const [isAddButtonPanelOpen, setIsAddButtonPanelOpen] = useState(false)

  // State capturing the navigational stack of routes.
  const [navStack, setNavStack] = useState<Array<Route>>([Route.Home])

  function isCurrentRoute(route: Route) {
    return navStack[navStack.length - 1] === route
  }

  function navigateForward(next: Route) {
    const nextNavStack = []
    navStack.forEach((r) => nextNavStack.push(r))
    nextNavStack.push(next)
    setNavStack(nextNavStack)
  }

  function navigateBack() {
    if (navStack.length < 1) {
      throw new Error("Cannot navigate further back.")
    }
    const nextNavStack = []
    for (let i = 0; i < navStack.length - 1; ++i) {
      nextNavStack.push(navStack[i])
    }
    setNavStack(nextNavStack)
  }

  // Update visibility state of the banner when profile completion state changes.
  useEffect(() => setShowIncompleteProfileBanner(!isProfileComplete), [isProfileComplete])

  return (
    <ProfileModelContext.Provider value={profile}>
      <Page>
        {isCurrentRoute(Route.Home) &&
          <Section title="Home">
            <Text style={[styles.text, { marginBottom: 12 }]} variant="bodyLarge">
              Welcome {profile.Name || profile.PhoneNumber || 'Nameless'}!
            </Text>
            <Banner
              visible={showIncompleteProfileBanner}
              elevation={4}
              style={{ marginBottom: 12 }}
              actions={[
                {
                  icon: 'close',
                  label: 'Close',
                  onPress: () => setShowIncompleteProfileBanner(false),
                },
                {
                  icon: 'wrench',
                  label: 'Fix it',
                  onPress: () => navigateForward(Route.Profile),
                },
              ]}
              icon="alert-circle-outline">
              Your profile is incomplete. Please pick a name and avatar.
            </Banner>
            <Text style={[styles.text, { marginBottom: 12 }]} variant="bodyLarge">
              This is where you will see your activities, once you create them.
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginEnd: 12 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={() => navigateForward(Route.Profile)}>
                  Profile
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={user.signOut}>
                  Sign out
                </Button>
              </View>
            </View>
            <Portal>
              <FAB.Group
                open={isAddButtonPanelOpen}
                visible
                icon={isAddButtonPanelOpen ? 'minus' : 'plus'}
                actions={[
                  {
                    icon: 'run',
                    label: 'Activity',
                    onPress: () => { },
                  },
                ]}
                onStateChange={({ open }) => setIsAddButtonPanelOpen(open)} />
            </Portal>
          </Section>
        }
        {isCurrentRoute(Route.Profile) &&
          <Profile
            setProfile={(updatedProfile) => {
              setProfile(updatedProfile)
              navigateBack()
            }}
            close={navigateBack} />
        }
      </Page>
    </ProfileModelContext.Provider>
  )
}

export default Home