import React, { useEffect, useState } from 'react'
import { Button, Text } from 'react-native-paper'
import FrontendService from './FrontendService'
import { LoadingAnimation, Page, Section } from './Layouts'
import { ProfileModel, UserModel } from './Models'
import styles from './Styles'

interface HomeProps {
  user: UserModel
}

export default function Home(props: HomeProps): JSX.Element {
  const [profile, setProfile] = useState<ProfileModel | null>(null)
  const [error, setError] = useState<string | null>()

  useEffect(() => {
    FrontendService.get(props.user).getOrCreateProfile({
      phoneNumber: props.user.phoneNumber,
    }).then(setProfile).catch(setError)
  }, [])

  if (!profile) {
    return (
      <Page>
        <Section title="Home">
          <LoadingAnimation />
        </Section>
      </Page>
    )
  }

  return (
    <Page>
      <Section title="Home">
        <Text style={styles.text} variant="bodyLarge">
          Welcome {profile.Name || profile.PhoneNumber || 'Nameless'}!
        </Text>
        <Button style={styles.button} labelStyle={styles.buttonLabel} mode="contained" onPress={props.user.signOut}>
          Sign out
        </Button>
      </Section>
    </Page>
  )
}