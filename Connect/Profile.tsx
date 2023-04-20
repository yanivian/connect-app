import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ConsumerApi, ImageModel, ProfileModel } from './ConsumerApi';
import { Page, Section } from './Layout';
import styles from './Styles';
import PlaceholderImage from './images/user.svg';

interface ProfileProps {
  isDarkMode: boolean,
  user: FirebaseAuthTypes.User,
  setProfile: React.Dispatch<React.SetStateAction<ProfileModel | null>>,
  signOut: () => Promise<void>,
}

export default function Profile(props: ProfileProps): JSX.Element {
  const [errorLoading, setErrorLoading] = useState<string>()
  const [name, setName] = useState<string | null>(null)
  const [emailAddress, setEmailAddress] = useState<string | null>(null)
  const [image, setImage] = useState<ImageModel | null>(null)
  const [creating, setCreating] = useState(false)
  const [errorCreating, setErrorCreating] = useState<string>()

  useEffect(() => {
    ConsumerApi.get(props.user).getOrCreateProfile({
      phoneNumber: props.user.phoneNumber || '',
    })
      .then((profile) => {
        setName(profile.Name)
        setEmailAddress(profile.EmailAddress)
        setImage(profile.Image)
      })
      .catch(setErrorLoading)
  }, [])

  if (errorLoading) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Error" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Error loading profile.</Text>
          <Text style={[styles.errorText, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>{errorLoading}</Text>
        </Section>
      </Page>)
  }

  if (errorCreating) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Error" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>Error creating profile.</Text>
          <Text style={[styles.errorText, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>{errorCreating}</Text>
        </Section>
      </Page>)
  }

  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Profile" isDarkMode={props.isDarkMode}>
        <Text style={[styles.text, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>Can you share a little more about you?</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={[styles.profileImage, {
            backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
          }]}>
            {image?.URL &&
              <TouchableOpacity onPress={() => setImage(null)}>
                <Image source={{ uri: image.URL }} />
              </TouchableOpacity>}
            {!image?.URL &&
              <TouchableOpacity onPress={() => { console.log("TODO Upload flow.") }}>
                <PlaceholderImage />
              </TouchableOpacity>}
          </View>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <TextInput editable={!creating}
              style={[styles.textInput, {
                backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
                borderColor: props.isDarkMode ? Colors.light : Colors.dark,
                color: props.isDarkMode ? Colors.white : Colors.black,
                marginBottom: 12,
              }]}
              placeholder="Name"
              placeholderTextColor={props.isDarkMode ? Colors.light : Colors.dark}
              value={name || ''}
              autoComplete="name"
              autoCapitalize="words"
              onChangeText={setName}
              inputMode="text"
              textAlign="center" />
            <TextInput editable={!creating}
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
          </View>
        </View>
        <Pressable disabled={creating}
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={async () => {
            setCreating(true)
            return ConsumerApi.get(props.user).updateProfile({
              name: name,
              emailAddress: emailAddress
            }).then(props.setProfile)
              .catch(setErrorCreating)
              .finally(() => setCreating(false))
          }}>
          <Text
            style={[styles.buttonText, {
              color: props.isDarkMode ? Colors.black : Colors.white,
            }]}>
            Finish
          </Text>
        </Pressable>
      </Section>
    </Page>)
}
