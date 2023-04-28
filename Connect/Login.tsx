import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Button, HelperText, Text, TextInput } from 'react-native-paper'
import { UserModelContext } from './Contexts'
import { LoadingAnimation, Page, Section } from './Layouts'
import { UserModel } from './Models'
import styles from './Styles'

type LoginProps = PropsWithChildren<{}>

/** React component that logs a user in via Firebase's phone number auth flow. */
const Login = (props: LoginProps): JSX.Element => {
  // State that this component is responsible for providing to its children.
  const [user, setUser] = useState<UserModel | null>(null)

  // State that is collected internal to this component towards the auth flow.
  const [phoneNumber, setPhoneNumber] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null)
  const [code, setCode] = useState('')

  // UI state for when content is loading or when an error occurs.
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>()

  /**
   * Encapsulates the Firebase User and provides a revised contract.
   * Nested within the component because signOut accessed internal state.
   */
  class FirebaseUserModel implements UserModel {
    private user_!: FirebaseAuthTypes.User

    uid!: string  // Same as Firebase User.
    phoneNumber!: string  // Firebase User allows null.

    constructor(user: FirebaseAuthTypes.User) {
      this.user_ = user
      this.uid = user.uid
      this.phoneNumber = user.phoneNumber!
    }

    // Requires encapsulation.
    async getIdToken(): Promise<string> {
      return this.user_.getIdToken(/* forceRefresh= */ true)
    }

    // Not provided by Firebase User.
    async signOut(): Promise<void> {
      return auth().signOut().then(() => {
        // Reset internal state.
        setConfirmationResult(null)
        setCode('')
      })
    }
  }

  // Propagate auth state changes to user state.
  useEffect(() => auth().onAuthStateChanged((user) => {
    setUser(!user ? null : new FirebaseUserModel(user))
  }), [] /* Only on first render */)

  async function signInWithPhoneNumber() {
    setLoading(true)
    setError(null)
    // TODO: Validate phone number.
    return auth().signInWithPhoneNumber('+1' + phoneNumber, /** forceResend= */ true)
      .then(setConfirmationResult)
      .catch((err) => {
        const errorCode = err.message.match(/\[([^\]]*)\]\s/)?.[1] || 'unknown'
        switch (errorCode) {
          case 'auth/invalid-phone-number':
          case 'auth/missing-phone-number':
            setError('Please enter a ten-digit phone number.')
            break
          default:
            setError(`Sorry, something went wrong. (${errorCode})`)
            break
        }
      }).finally(() => setLoading(false))
  }

  async function verifyCode() {
    setLoading(true)
    setError(null)
    // TODO: Validate code.
    return confirmationResult!.confirm(code).then((userCredential) => {
      userCredential?.user && setUser(new FirebaseUserModel(userCredential.user))
    })
      .catch((err) => {
        const errorCode = err.message.match(/\[([^\]]*)\]\s/)?.[1] || 'unknown'
        switch (errorCode) {
          case 'auth/unknown':
            setCode('')
            setError('Please enter the verification code.')
            break
          case 'auth/invalid-verification-code':
            setCode('')
            setError('That code was invalid. Please try again.')
            break
          default:
            setError(`Sorry, something went wrong. (${errorCode})`)
            break
        }
      }).finally(() => setLoading(false))
  }

  // Step 1: Collect phone number and get ConfirmationResult.
  if (!user && !confirmationResult) {
    return (
      <Page>
        <Section title="Login">
          <Text style={styles.text} variant="bodyLarge">
            We collect your phone number to uniquely identify you.
          </Text>
          <TextInput
            autoFocus
            style={styles.textInput}
            mode="outlined"
            label="Phone number"
            left={<TextInput.Affix text="+1" />}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onSubmitEditing={async (e) => signInWithPhoneNumber()}
            inputMode="numeric"
            disabled={loading}
            error={!!error} />
          <HelperText
            type="error"
            visible={!!error}
            style={{ marginBottom: 12 }}>
            {error}
          </HelperText>
          <Button
            style={styles.button}
            labelStyle={styles.buttonLabel}
            mode="contained"
            onPress={signInWithPhoneNumber}
            disabled={loading}>
            Login
          </Button>
          {loading && <LoadingAnimation />}
        </Section>
      </Page>
    )
  }

  // Step 2: Collect verification code and get Firebase User.
  if (!user) {
    return (
      <Page>
        <Section title="Login">
          <Text style={styles.text} variant="bodyLarge">
            We've sent a verification code to your phone number, and it should arrive momentarily.
          </Text>
          <TextInput
            autoFocus
            style={styles.textInput}
            mode="outlined"
            label="Code"
            value={code}
            onChangeText={setCode}
            onSubmitEditing={async (e) => verifyCode()}
            autoComplete="off"
            inputMode="numeric"
            disabled={loading}
            error={!!error} />
          <HelperText
            type="error"
            visible={!!error}
            style={{ marginBottom: 12 }}>
            {error}
          </HelperText>
          <Button
            style={[styles.button, { marginBottom: 12 }]}
            labelStyle={styles.buttonLabel}
            mode="contained"
            onPress={verifyCode}
            disabled={loading}>
            Verify
          </Button>
          <Button
            mode="text"
            labelStyle={styles.anchorButtonLabel}
            style={styles.button}
            onPress={() => setConfirmationResult(null)}
            disabled={loading}>
            Back
          </Button>
          {loading && <LoadingAnimation />}
        </Section>
      </Page>
    )
  }

  // Step 3: Show children within the context of the logged-in user.
  return (
    <UserModelContext.Provider value={user}>
      {props.children}
    </UserModelContext.Provider>
  )
}

export default Login