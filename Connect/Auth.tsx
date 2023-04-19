import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import React, { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
} from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";
import { Page, Section } from './Layout';
import styles from './Styles';

interface AuthProps {
  isDarkMode: boolean;
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
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Sign in" isDarkMode={props.isDarkMode}>
          <Text style={[styles.text, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>
            We collect your phone number to uniquely identify you.
          </Text>
          <TextInput
            style={[styles.textInput, {
              backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
              borderColor: props.isDarkMode ? Colors.light : Colors.dark,
              color: props.isDarkMode ? Colors.white : Colors.black,
            }]}
            placeholder="Phone number"
            placeholderTextColor={props.isDarkMode ? Colors.light : Colors.dark}
            value={phoneNumber || ''}
            onChangeText={setPhoneNumber}
            onSubmitEditing={e => signInWithPhoneNumber()}
            inputMode="numeric"
            textAlign="center"
            autoFocus />
          <Pressable
            style={[styles.button, {
              backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
            }]}
            onPress={signInWithPhoneNumber}>
            <Text
              style={[styles.buttonText, {
                color: props.isDarkMode ? Colors.black : Colors.white,
              }]}>
              Sign in
            </Text>
          </Pressable>
          {error && <Text style={[styles.errorText, {
            color: props.isDarkMode ? Colors.white : Colors.black,
          }]}>
            {error}
          </Text>}
        </Section>
      </Page>
    )
  }

  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Sign in" isDarkMode={props.isDarkMode}>
        <Text style={[styles.text, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>
          We've sent a verification code to your phone number, and it should arrive momentarily.
        </Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: props.isDarkMode ? Colors.dark : Colors.light,
            borderColor: props.isDarkMode ? Colors.light : Colors.dark,
            color: props.isDarkMode ? Colors.white : Colors.black,
            letterSpacing: 10,
          }]}
          placeholder="000000"
          value={code}
          onChangeText={setCode}
          onSubmitEditing={e => verifyCode()}
          autoComplete="off"
          inputMode="numeric"
          textAlign="center"
          autoFocus />
        <Pressable
          style={[styles.button, {
            backgroundColor: props.isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={verifyCode}>
          <Text
            style={[styles.buttonText, {
              color: props.isDarkMode ? Colors.black : Colors.white,
            }]}>
            Verify code</Text>
        </Pressable>
        {error && <Text style={[styles.errorText, {
          color: props.isDarkMode ? Colors.white : Colors.black,
        }]}>
          {error}
        </Text>}
      </Section>
    </Page>
  );
}