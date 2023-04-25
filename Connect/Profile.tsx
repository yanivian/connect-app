import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { Button, Menu, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper'
import { ConsumerApi, ImageModel, ProfileModel } from './ConsumerApi'
import { LoadingAnimation, Page, Section } from './Layout'
import styles from './Styles'
import ProfilePlaceholder from './images/ProfilePlaceholder.svg'

interface ProfileProps {
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>()
  const [imageMenuVisible, setImageMenuVisible] = useState(false)

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

  const theme = useTheme()

  async function pickFromImageLibrary(): Promise<ImagePicker.ImagePickerResponse> {
    const options: ImagePicker.ImageLibraryOptions = {
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false,
    }
    return ImagePicker.launchImageLibrary(options)
  }

  async function captureFromCamera(): Promise<ImagePicker.ImagePickerResponse> {
    const options: ImagePicker.CameraOptions = {
      cameraType: 'front',
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false,
    }
    return ImagePicker.launchCamera(options)
  }

  async function uploadPickedImage(response: ImagePicker.ImagePickerResponse): Promise<void> {
    if (!response || response.didCancel || !response.assets || response.assets.length === 0) {
      return
    }
    if (response.errorCode || response.errorMessage) {
      setError('[' + response.errorCode + '] ' + response.errorMessage)
      return
    }
    const asset = response.assets[0]
    const localFile = {
      name: asset.fileName || '',
      type: asset.type || '',
      uri: asset.uri || '',
    }
    setUploadingImage(true);
    return ConsumerApi.get(props.user)
      .uploadImage(localFile)
      .then(setImage)
      .catch(setError)
      .finally(() => setUploadingImage(false))
  }

  if (errorLoading) {
    return (
      <Page>
        <Section title="Profile">
          <Text style={styles.text} variant="bodyLarge">
            We're sorry. Something went wrong.
          </Text>
          {errorLoading && <Text style={styles.errorText} variant="bodyLarge">
            {errorLoading}
          </Text>}
        </Section>
      </Page>)
  }

  return (
    <Page>
      <Section title="Profile">
        {!originalProfile && <LoadingAnimation />}
        {originalProfile && <View>
          <Text style={styles.text} variant="bodyLarge">
            Can you share a little more about you?
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <View style={[styles.profileImageContainer, {
              borderWidth: 1,
              borderColor: theme.colors.onPrimaryContainer,
            }]}>
              <Menu
                visible={imageMenuVisible}
                onDismiss={() => setImageMenuVisible(false)}
                anchor={
                  <TouchableRipple disabled={creating || uploadingImage} onPress={() => setImageMenuVisible(true)}>
                    <View>
                      {image?.URL &&
                        <Image style={styles.profileImage} source={{ uri: `${image.URL}=s200-c` }} />}
                      {!image?.URL &&
                        <ProfilePlaceholder style={{
                          backgroundColor: theme.colors.primary,
                        }} />}
                    </View>
                  </TouchableRipple>
                }
                anchorPosition="bottom">
                {!image?.URL && <Menu.Item leadingIcon="image" onPress={async () => {
                  setImageMenuVisible(false)
                  return pickFromImageLibrary().then(uploadPickedImage)
                }} title="Add from Gallery" />}
                {!image?.URL && <Menu.Item leadingIcon="camera" onPress={async () => {
                  setImageMenuVisible(false)
                  return captureFromCamera().then(uploadPickedImage)
                }} title="Add with Camera" />}
                {image?.URL && <Menu.Item leadingIcon="image" onPress={async () => {
                  setImageMenuVisible(false)
                  return pickFromImageLibrary().then(uploadPickedImage)
                }} title="Replace from Gallery" />}
                {image?.URL && <Menu.Item leadingIcon="camera" onPress={async () => {
                  setImageMenuVisible(false)
                  return captureFromCamera().then(uploadPickedImage)
                }} title="Replace with Camera" />}
                {image?.URL && <Menu.Item leadingIcon="delete" onPress={() => {
                  setImage(null)
                  setImageMenuVisible(false)
                }} title="Clear" />}
              </Menu>
            </View>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <TextInput
                style={[styles.textInput, {
                  marginBottom: 12,
                }]}
                mode="outlined"
                label="Name"
                value={name || ''}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                inputMode="text"
                disabled={creating} />
              <TextInput
                style={styles.textInput}
                mode="outlined"
                label="Email address"
                value={emailAddress || ''}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                disabled={creating} />
            </View>
          </View>
          <Button
            mode="contained"
            style={[styles.button, {
              marginBottom: 12,
            }]}
            labelStyle={styles.buttonLabel}
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
            }}
            disabled={creating || uploadingImage}>
            Finish
          </Button>
          <Button
            mode="text"
            labelStyle={styles.anchorButtonLabel}
            style={styles.button}
            onPress={() => props.setProfile(originalProfile)}
            disabled={creating || uploadingImage}>
            Skip
          </Button>
          {(creating || uploadingImage) && <LoadingAnimation />}
          {error && <Text style={styles.errorText} variant="bodyLarge">
            {error}
          </Text>}
        </View>}
      </Section>
    </Page >)
}
