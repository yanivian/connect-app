import styles from './Styles';
import Auth from './Auth';
import Home from './Home';
import Profile from './Profile';
import { ProfileModel } from './ConsumerApi';
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
    );
  }

  if (!profile) {
    return (
      <Profile isDarkMode={isDarkMode} user={user} setProfile={setProfile} signOut={signOut} />
    );
  }

  return (
    <Home isDarkMode={isDarkMode} user={user} profile={profile} signOut={signOut} />
  );
}

export default App;