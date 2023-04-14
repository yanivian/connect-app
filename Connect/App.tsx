import styles from './Styles';
import Auth from './Auth';
import { Profile, ProfileModel } from './Profile';
import { Page, Section } from './Layout';
import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  Pressable,
  Text,
  useColorScheme,
} from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<ProfileModel | null>(null);

  useEffect(() => auth().onAuthStateChanged(setUser), []);

  async function signOut() {
    await auth().signOut();
  }

  if (!user) {
    return (
      <Auth isDarkMode={isDarkMode} setUser={setUser} />
    )
  }

  if (!profile) {
    return (
      <Profile isDarkMode={isDarkMode} user={user} setProfile={setProfile} />
    )
  }

  return (
    <Page isDarkMode={isDarkMode}>
      <Section title="Home" isDarkMode={isDarkMode}>
        <Text style={[styles.text, {
          color: isDarkMode ? Colors.white : Colors.black,
        }]}>Welcome {profile.Name || user.uid}</Text>
        <Pressable
          style={[styles.button, {
            backgroundColor: isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={signOut}>
          <Text
            style={[styles.buttonText, {
              color: isDarkMode ? Colors.black : Colors.white,
            }]}>
            Sign out</Text>
        </Pressable>
      </Section>
    </Page>
  );
}

export default App;