import React, { useContext, useEffect, useState } from 'react'
import { Banner, Modal, Portal } from 'react-native-paper'
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
      <Portal.Host>
        <Page>
          <Section
            title="Home"
            actions={[
              { label: 'Profile', icon: 'account', callback: () => setEditingProfile(true) },
              { label: 'Sign out', icon: 'logout', callback: () => user.signOut() },
            ]}
          >
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

            {!isEditingProfile &&
              <MyActivities />
            }
          </Section>
          <Portal>
            <Modal
              contentContainerStyle={styles.fullscreen}
              onDismiss={() => setEditingProfile(false)}
              theme={{ colors: { backdrop: 'transparent' } }}
              visible={isEditingProfile}
            >
              <Profile
                save={setProfile}
                close={() => setEditingProfile(false)}
              />
            </Modal>
          </Portal>
        </Page>
      </Portal.Host>
    </ProfileModelContext.Provider>
  )
}

export default Home