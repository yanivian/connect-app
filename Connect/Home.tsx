import styles from './Styles';
import { Page, Section } from './Layout';
import { ProfileModel } from './ConsumerApi';
import React from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  Pressable,
  Text,
} from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";

interface HomeProps {
  isDarkMode: boolean;
  user: FirebaseAuthTypes.User;
  profile: ProfileModel;
  signOut: () => Promise<void>;
}

export default function Home(props: HomeProps): JSX.Element {
  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Home" isDarkMode={props.isDarkMode}>
        <Text style={[styles.text, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>Welcome {props.profile.Name || props.user.uid}</Text>
        <Pressable
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={props.signOut}>
          <Text
            style={[styles.buttonText, {
              color: props.isDarkMode ? Colors.black : Colors.white,
            }]}>
            Sign out</Text>
        </Pressable>
      </Section>
    </Page>
  );
}
