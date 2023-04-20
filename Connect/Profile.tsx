import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { useEffect, useState } from 'react'
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { ConsumerApi, ImageModel, ProfileModel } from './ConsumerApi'
import { Page, Section } from './Layout'
import styles from './Styles'
import AddProfileImage from './images/AddProfileImage.svg'
import RemoveProfileImage from './images/RemoveProfileImage.svg'

interface ProfileProps {
  isDarkMode: boolean,
  user: FirebaseAuthTypes.User,
  setProfile: React.Dispatch<React.SetStateAction<ProfileModel | null>>,
  signOut: () => Promise<void>,
}

export default function Profile(props: ProfileProps): JSX.Element {
  const [errorLoading, setErrorLoading] = useState<string>()
  const [originalProfile, setOriginalProfile] = useState<ProfileModel | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [emailAddress, setEmailAddress] = useState<string | null>(null)
  const [image, setImage] = useState<ImageModel | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>()

  useEffect(() => {
    ConsumerApi.get(props.user).getOrCreateProfile({
      phoneNumber: props.user.phoneNumber || '',
    }).then((profile) => {
      setOriginalProfile(profile)
      setName(profile.Name)
      setEmailAddress(profile.EmailAddress)
      setImage(profile.Image)
    }).catch(setErrorLoading)
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

  async function uploadImage() {
    const options: ImagePicker.ImageLibraryOptions = {
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false,
    }
    ImagePicker.launchImageLibrary(options).then((response) => {
      if (!response || response.didCancel || !response.assets || response.assets.length === 0) {
        return
      }
      if (response.errorCode || response.errorMessage) {
        setError('[' + response.errorCode + '] ' + response.errorMessage)
        return
      }
      const asset = response.assets[0]
      return ConsumerApi.get(props.user).uploadImage({
        name: asset.fileName || '',
        type: asset.type || '',
        uri: asset.uri || '',
      })
    }).then((image) => {
      if (image) {
        console.log(image)
        setImage(image)
      }
    }).catch(setError)
  }

  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Profile" isDarkMode={props.isDarkMode}>
        <Text style={[styles.text, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>Can you share a little more about you?</Text>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={[styles.profileImageContainer, {
            backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
          }]}>
            {image?.URL &&
              <TouchableOpacity onPress={() => setImage(null)}>
                <Image style={styles.profileImage} source={{ uri: `${image.URL}=s108-c` }} />
                <RemoveProfileImage style={styles.profileImageActionButton} />
              </TouchableOpacity>}
            {!image?.URL &&
              <TouchableOpacity onPress={uploadImage}>
                <AddProfileImage style={styles.profileImageActionButton} />
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
            setError(null)
            return ConsumerApi.get(props.user).updateProfile({
              name: name,
              emailAddress: emailAddress,
              image: image?.ID || null,
            }).then(props.setProfile)
              .catch(setError)
              .finally(() => setCreating(false))
          }}>
          <Text
            style={[styles.buttonText, {
              color: props.isDarkMode ? Colors.black : Colors.white,
            }]}>
            Finish
          </Text>
        </Pressable>
        <Pressable disabled={creating}
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.darker : Colors.lighter,
          }]}
          onPress={() => props.setProfile(originalProfile)}>
          <Text
            style={[styles.anchorText, {
              color: props.isDarkMode ? Colors.white : Colors.black,
            }]}>
            Skip
          </Text>
        </Pressable>
        {error && <Text style={[styles.errorText, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>
          {error}
        </Text>}
      </Section>
    </Page>)
}
