import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { LoadingAnimation, Page, Section } from './Layout';
import styles from './Styles';

interface AuthProps {
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
}

export default function Auth(props: AuthProps): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>();

  async function signInWithPhoneNumber() {
    setConfirming(true);
    setError(null);
    return auth().signInWithPhoneNumber('+1' + phoneNumber, /** forceResend= */ true)
      .then(setConfirmationResult)
      .catch((err) => {
        const errorCode = err.message.match(/\[([^\]]*)\]\s/)?.[1] || 'unknown';
        switch (errorCode) {
          case 'auth/invalid-phone-number':
          case 'auth/missing-phone-number':
            setError('Please enter a ten-digit phone number.');
            break;
          default:
            setError(`Sorry, something went wrong. (${errorCode})`);
            break;
        }
      }).finally(() => setConfirming(false));
  }

  async function verifyCode() {
    setConfirming(true);
    setError(null);
    if (!confirmationResult) {
      return
    }
    return confirmationResult.confirm(code).then((userCredential) =>
      userCredential?.user && props.setUser(userCredential.user))
      .catch((err) => {
        const errorCode = err.message.match(/\[([^\]]*)\]\s/)?.[1] || 'unknown';
        switch (errorCode) {
          case 'auth/unknown':
            setCode('');
            setError('Please enter the verification code.');
            break;
          case 'auth/invalid-verification-code':
            setCode('');
            setError('That code was invalid. Please try again.');
            break;
          default:
            setError(`Sorry, something went wrong. (${errorCode})`);
            break;
        }
      }).finally(() => setConfirming(false));
  }

  if (!confirmationResult) {
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
            disabled={confirming}
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
            disabled={confirming}>
            Login
          </Button>
          {confirming && <LoadingAnimation />}
        </Section>
      </Page>
    )
  }

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
          disabled={confirming}
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
          disabled={confirming}>
          Verify
        </Button>
        <Button
          mode="text"
          labelStyle={styles.anchorButtonLabel}
          style={styles.button}
          onPress={() => setConfirmationResult(null)}
          disabled={confirming}>
          Back
        </Button>
        {confirming && <LoadingAnimation />}
      </Section>
    </Page>
  );
}