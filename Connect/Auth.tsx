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

interface AuthProps {
  isDarkMode: boolean;
  setUser: React.Dispatch<React.SetStateAction<FirebaseAuthTypes.User | null>>;
}

function Auth(props: AuthProps): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');

  async function signInWithPhoneNumber() {
    if (phoneNumber) {
      const confirmationResult = await auth().signInWithPhoneNumber('+1' + phoneNumber);
      setConfirmationResult(confirmationResult);
    }
  }

  async function verifyCode() {
    const userCredential = await confirmationResult?.confirm(code);
    if (userCredential?.user) {
      props.setUser(userCredential.user);
    }
  }

  if (!confirmationResult) {
    return (
      <Page isDarkMode={props.isDarkMode}>
        <Section title="Auth" isDarkMode={props.isDarkMode}>
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
            textAlign="center" />
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
        </Section>
      </Page>
    )
  }

  return (
    <Page isDarkMode={props.isDarkMode}>
      <Section title="Auth" isDarkMode={props.isDarkMode}>
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
          textAlign="center" />
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
      </Section>
    </Page>
  );
}

export default Auth;