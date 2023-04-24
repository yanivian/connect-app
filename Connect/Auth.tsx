import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useState } from 'react';
import { Button, Text, TextInput } from 'react-native-paper';
import { Page, Section } from './Layout';
import styles from './Styles';

interface AuthProps {
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
}

export default function Auth(props: AuthProps): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>();

  async function signInWithPhoneNumber() {
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
      });
  }

  async function verifyCode() {
    setError(null);
    return confirmationResult?.confirm(code).then((userCredential) =>
      userCredential?.user && props.setUser(userCredential.user))
      .catch((err) => {
        const errorCode = err.message.match(/\[([^\]]*)\]\s/)?.[1] || 'unknown';
        switch (errorCode) {
          case 'auth/invalid-verification-code':
            setCode('');
            setError('That code was invalid. Please try again.');
            break;
          default:
            setError(`Sorry, something went wrong. (${errorCode})`);
            break;
        }
      });
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
            style={[styles.textInput, {
              marginBottom: 12,
            }]}
            mode="outlined"
            label="Phone number"
            left={<TextInput.Affix text="+1" />}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onSubmitEditing={e => signInWithPhoneNumber()}
            inputMode="numeric"
            error={!!error} />
          <Button style={styles.button} labelStyle={styles.buttonLabel} mode="contained" onPress={signInWithPhoneNumber}>
            Login
          </Button>
          {error && <Text style={styles.errorText} variant="bodyLarge">
            {error}
          </Text>}
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
          style={[styles.textInput, {
            marginBottom: 12,
          }]}
          mode="outlined"
          label="Code"
          value={code}
          onChangeText={setCode}
          onSubmitEditing={e => verifyCode()}
          autoComplete="off"
          inputMode="numeric"
          error={!!error} />
        <Button style={styles.button} labelStyle={styles.buttonLabel} mode="contained" onPress={verifyCode}>
          Verify
        </Button>
        {error && <Text style={styles.errorText} variant="bodyLarge">
          {error}
        </Text>}
      </Section>
    </Page>
  );
}