import React, { useContext, useState } from 'react'
import { Image, View } from 'react-native'
import * as ImagePicker from 'react-native-image-picker'
import { Button, HelperText, Menu, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper'
import { ProfileModelContext, UserModelContext } from './Contexts'
import FrontendService from './FrontendService'
import { LoadingAnimation, Section } from './Layouts'
import { ImageModel, ProfileModel } from './Models'
import styles from './Styles'
import ProfilePlaceholder from './images/ProfilePlaceholder.svg'

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

interface ProfileProps {
  // Callback to save any changes made to the profile.
  save: (profile: ProfileModel) => void
  // Callback to close the profile screen, abandoning any unsaved changes.
  close: () => void
}

const Profile = (props: ProfileProps): JSX.Element => {
  const user = useContext(UserModelContext)!
  const profile = useContext(ProfileModelContext)!

  const [name, setName] = useState<string | null>(profile.Name)
  const [emailAddress, setEmailAddress] = useState<string | null>(profile.EmailAddress)
  const [image, setImage] = useState<ImageModel | null>(profile.Image)

  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>()
  const [imageMenuVisible, setImageMenuVisible] = useState(false)

  const theme = useTheme()

  async function uploadPickedImage(response: ImagePicker.ImagePickerResponse): Promise<void> {
    if (!response || response.didCancel) {
      return
    }
    if (response.errorCode || response.errorMessage) {
      setError('[' + response.errorCode + '] ' + response.errorMessage)
      return
    }
    const asset = response.assets![0]!  // At least one asset is expected.
    const localFile = {
      name: asset.fileName!,
      type: asset.type!,
      uri: asset.uri!,
    }
    setUploadingImage(true)
    return FrontendService.get(user)
      .uploadImage(localFile)
      .then(setImage)
      .catch(setError)
      .finally(() => setUploadingImage(false))
  }

  return (
    <Section title="Profile" close={{ icon: 'close', callback: props.close }}>
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
                <TouchableRipple disabled={saving || uploadingImage} onPress={() => setImageMenuVisible(true)}>
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
              disabled={saving} />
            <TextInput
              style={styles.textInput}
              mode="outlined"
              label="Email address"
              value={emailAddress || ''}
              onChangeText={setEmailAddress}
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              disabled={saving} />
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
            setSaving(true)
            setError(null)
            return FrontendService.get(user).updateProfile({
              name: name,
              emailAddress: emailAddress,
              image: image?.ID || null,
            }).then(props.save)
              .then(props.close)
              .catch(setError)
              .finally(() => setSaving(false))
          }}
          disabled={saving || uploadingImage}>
          Save
        </Button>
        {(saving || uploadingImage) && <LoadingAnimation />}
      </View>
    </Section>
  )
}

export default Profile