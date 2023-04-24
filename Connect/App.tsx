import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useEffect, useState } from 'react';
import Auth from './Auth';
import { ProfileModel } from './ConsumerApi';
import Home from './Home';
import Profile from './Profile';

function App(): JSX.Element {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<ProfileModel | null>(null);

  useEffect(() => auth().onAuthStateChanged(setUser), []);

  async function signOut() {
    return auth().signOut().then(() => setProfile(null));
  }

  if (!user) {
    return (
      <Auth setUser={setUser} />
    );
  }

  if (!profile) {
    return (
      <Profile user={user} setProfile={setProfile} signOut={signOut} />
    );
  }

  return (
    <Home user={user} profile={profile} signOut={signOut} />
  );
}

export default App;