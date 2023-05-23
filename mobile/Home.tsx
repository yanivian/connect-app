import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Banner, Button, Text } from 'react-native-paper'
import { LoginContext, ProfileModelContext, UserModelContext } from './Contexts'
import { Page, Section } from './Layouts'
import MyActivities from './MyActivities'
import Profile from './Profile'
import styles from './Styles'

const Home = (): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!

  // State with which to override the profile available to its children.
  const [profile, setProfile] = useState(loginContext.Profile)
  const isProfileComplete = !!profile.Name && !!profile.Image

  // Update visibility state of the banner when profile completion state changes.
  useEffect(() => setShowIncompleteProfileBanner(!isProfileComplete), [isProfileComplete])

  // States for profile manipulation.
  const [showIncompleteProfileBanner, setShowIncompleteProfileBanner] = useState(false)
  const [isEditingProfile, setEditingProfile] = useState(loginContext.IsFirstLogin)

  return (
    <ProfileModelContext.Provider value={profile}>
      <Page>
        {isEditingProfile &&
          <Profile
            save={setProfile}
            close={() => setEditingProfile(false)}
          />
        }
        {!isEditingProfile &&
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
                  label: 'Close',
                  onPress: () => setShowIncompleteProfileBanner(false),
                },
                {
                  label: 'Fix it',
                  onPress: () => setEditingProfile(true),
                },
              ]}
              icon="alert-circle-outline">
              Your profile is incomplete. Please pick a name and avatar.
            </Banner>

            <MyActivities />

            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginEnd: 12 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={() => setEditingProfile(true)}>
                  Profile
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={user.signOut}>
                  Sign out
                </Button>
              </View>
            </View>
          </Section>}
      </Page>
    </ProfileModelContext.Provider>
  )
}

export default Home