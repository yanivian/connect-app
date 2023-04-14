import styles from './Styles';
import { Page, Section } from './Layout';
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

export interface ProfileModel {
  UserID: string;
  PhoneNumber: string;
  CreatedTimestampMillis: number;
  Name: string | null;
  EmailAddress: string | null;
  LastUpdatedTimestampMillis: number | null;
}

export function Profile(props: ProfileProps): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState();
  const [name, setName] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [errorCreating, setErrorCreating] = useState();

  props.user.getIdToken(true).then((token) => {
    const url = `https://connect-on-firebase.wm.r.appspot.com/profile/get?id=${encodeURIComponent(props.user.uid)}&token=${encodeURIComponent(token)}`;
    return fetch(url);
  }).then(async resp => {
    if (resp.ok) {
      return resp.json();
    } else if (resp.status === 404) {
      return Promise.resolve(null);
    } else {
      return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`));
    }
  }).then(props.setProfile)
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
          inputMode="email"
          textAlign="center" />
        <Pressable
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={async () => {
            setCreating(true);
            return props.user.getIdToken(true).then((token) => {
              var url = `https://connect-on-firebase.wm.r.appspot.com/profile/create?id=${encodeURIComponent(props.user.uid)}&token=${encodeURIComponent(token)}&phoneNumber=${encodeURIComponent(props.user.phoneNumber || '')}`;
              if (name) {
                url += `&name=${encodeURIComponent(name)}`;
              }
              if (emailAddress) {
                url += `&emailAddress=${encodeURIComponent(emailAddress)}`;
              }
              console.log(url);
              return fetch(url);
            }).then(async resp => {
              if (resp.ok) {
                return resp.json();
              } else {
                return resp.text().then((body) => Promise.reject(`Error (${resp.status}): ${body}`));
              }
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
