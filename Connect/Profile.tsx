import React, { useState } from 'react'
import { Image, View } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { Button, HelperText, Menu, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper'
import FrontendService from './FrontendService'
import { LoadingAnimation, Page, Section } from './Layouts'
import { ImageModel, ProfileModel, UserModel } from './Models'
import styles from './Styles'
import ProfilePlaceholder from './images/ProfilePlaceholder.svg'

interface ProfileProps {
  user: UserModel
  profile: ProfileModel
  setProfile: React.Dispatch<React.SetStateAction<ProfileModel | null>>
  signOut: () => Promise<void>
}

export default function Profile(props: ProfileProps): JSX.Element {
  const [name, setName] = useState<string | null>(props.profile.Name)
  const [emailAddress, setEmailAddress] = useState<string | null>(props.profile.EmailAddress)
  const [image, setImage] = useState<ImageModel | null>(props.profile.Image)

  const [creating, setCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>()
  const [imageMenuVisible, setImageMenuVisible] = useState(false)

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
    setUploadingImage(true)
    return FrontendService.get(props.user)
      .uploadImage(localFile)
      .then(setImage)
      .catch(setError)
      .finally(() => setUploadingImage(false))
  }

  return (
    <Page>
      <Section title="Profile">
        <View>
          <Text style={styles.text} variant="bodyLarge">
            Can you share a little more about yourself? Only your name and avatar will be visible to others.
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
          <HelperText
            type="error"
            visible={!!error}>
            {error}
          </HelperText>
          <Button
            mode="contained"
            style={[styles.button, { marginBottom: 12 }]}
            labelStyle={styles.buttonLabel}
            onPress={async () => {
              setCreating(true)
              setError(null)
              return FrontendService.get(props.user).updateProfile({
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
            style={styles.button}
            labelStyle={styles.anchorButtonLabel}
            onPress={() => props.setProfile(props.profile)}
            disabled={creating || uploadingImage}>
            Skip
          </Button>
          {(creating || uploadingImage) && <LoadingAnimation />}
        </View>
      </Section>
    </Page >)
}