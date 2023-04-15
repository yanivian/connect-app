import styles from './Styles';
import { Page, Section } from './Layout';
import { ConsumerApi, ProfileModel } from './ConsumerApi';
import React, { useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  Pressable,
  Text,
  TextInput,
} from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";

interface ProfileProps {
  isDarkMode: boolean;
  user: FirebaseAuthTypes.User;
  setProfile: React.Dispatch<React.SetStateAction<ProfileModel | null>>;
}

export default function Profile(props: ProfileProps): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string>();
  const [name, setName] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [errorCreating, setErrorCreating] = useState<string>();

  ConsumerApi.get(props.user).getProfile()
    .then(props.setProfile)
    .catch(setErrorLoading)
    .finally(() => setLoading(false));

  if (loading) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Profile" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Loading...</Text>
        </Section>
      </Page>);
  }

  if (errorLoading) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Error" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Error loading profile.</Text>
          <Text style={[styles.text, styles.code, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>{errorLoading}</Text>
        </Section>
      </Page>);
  }

  if (creating) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Profile" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Creating...</Text>
        </Section>
      </Page>);
  }

  if (errorCreating) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Error" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Error creating profile.</Text>
          <Text style={[styles.text, styles.code, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>{errorCreating}</Text>
        </Section>
      </Page>);
  }

  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Profile" isDarkMode={props.isDarkMode}>
        <Text style={[styles.text, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>Can you share a little more about you?</Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
            borderColor: props.isDarkMode ? Colors.light : Colors.dark,
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}
          placeholder="Name"
          placeholderTextColor={props.isDarkMode ? Colors.light : Colors.dark}
          value={name || ''}
          autoComplete="name"
          autoCapitalize="words"
          onChangeText={setName}
          inputMode="text"
          textAlign="center" />
        <TextInput
          style={[styles.textInput, {
            backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
            borderColor: props.isDarkMode ? Colors.light : Colors.dark,
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}
          placeholder="Email Address"
          placeholderTextColor={props.isDarkMode ? Colors.light : Colors.dark}
          value={emailAddress || ''}
          onChangeText={setEmailAddress}
          autoComplete="email"
          inputMode="email"
          textAlign="center" />
        <Pressable
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={async () => {
            setCreating(true);
            return ConsumerApi.get(props.user).createProfile({
              phoneNumber: props.user.phoneNumber || '',
              name: name,
              emailAddress: emailAddress,
            }).then(props.setProfile)
              .catch(setErrorCreating)
              .finally(() => setCreating(false));
          }}>
          <Text
            style={[styles.buttonText, {
              color: props.isDarkMode ? Colors.black : Colors.white,
            }]}>
            Finish
          </Text>
        </Pressable>
      </Section>
    </Page>);
}
