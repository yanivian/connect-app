import React from 'react'
import { Button, Text } from 'react-native-paper'
import { Page, Section } from './Layouts'
import { ProfileModel, UserModel } from './Models'
import styles from './Styles'

interface HomeProps {
  user: UserModel,
  profile: ProfileModel,
  signOut: () => Promise<void>,
}

export default function Home(props: HomeProps): JSX.Element {
  return (
    <Page>
      <Section title="Home">
        <Text style={styles.text} variant="bodyLarge">
          Welcome {props.profile.Name || props.user.phoneNumber}
        </Text>
        <Button style={styles.button} labelStyle={styles.buttonLabel} mode="contained" onPress={props.signOut}>
          Sign out
        </Button>
      </Section>
    </Page>
  )
}
