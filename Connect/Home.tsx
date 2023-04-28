import React, { useContext } from 'react'
import { Button, Text } from 'react-native-paper'
import { ProfileModelContext, UserModelContext } from './Contexts'
import { Page, Section } from './Layouts'
import styles from './Styles'

const Home = (): JSX.Element => {
  const user = useContext(UserModelContext)!
  const profile = useContext(ProfileModelContext)!

  return (
    <ProfileModelContext.Provider value={profile}>
      <Page>
        <Section title="Home">
          <Text style={styles.text} variant="bodyLarge">
            Welcome {profile.Name || profile.PhoneNumber || 'Nameless'}!
          </Text>
          <Button style={styles.button} labelStyle={styles.buttonLabel} mode="contained" onPress={user.signOut}>
            Sign out
          </Button>
        </Section>
      </Page>
    </ProfileModelContext.Provider>
  )
}

export default Home