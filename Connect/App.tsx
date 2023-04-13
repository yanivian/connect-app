import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from "react-native/Libraries/NewAppScreen";

import type { PropsWithChildren } from 'react';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={[styles.sectionContainer,
    {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function Wrap(content: JSX.Element): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.dark : Colors.light,
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => auth().onAuthStateChanged(setUser), []);

  async function signInWithPhoneNumber() {
    const confirmationResult = await auth().signInWithPhoneNumber('+1' + phoneNumber);
    console.log(confirmationResult);
    setConfirmationResult(confirmationResult);
  }

  async function verifyCode() {
    const userCredential = await confirmationResult?.confirm(code);
    console.log(userCredential);
    setUser(userCredential?.user || null);
  }

  async function signOut() {
    try {
      await auth().signOut();
    } finally {
      setPhoneNumber('');
      setConfirmationResult(null);
      setCode('');
    }
  }

  if (!user && !confirmationResult) {
    return Wrap(
      <Section title="Auth">
        <TextInput
          style={[styles.textInput, {
            backgroundColor: isDarkMode ? Colors.dark : Colors.light,
            borderColor: isDarkMode ? Colors.light : Colors.dark,
            color: isDarkMode ? Colors.white : Colors.black,
          }]}
          placeholder="Phone number"
          placeholderTextColor={isDarkMode ? Colors.light : Colors.dark}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onSubmitEditing={e => signInWithPhoneNumber()}
          inputMode="numeric"
          textAlign="center" />
        <Pressable
          style={[styles.button, {
            backgroundColor: isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={signInWithPhoneNumber}>
          <Text
            style={[styles.buttonText, {
              color: isDarkMode ? Colors.black : Colors.white,
            }]}>
            Sign in
          </Text>
        </Pressable>
      </Section>
    )
  }

  if (!user) {
    return Wrap(
      <Section title="Auth">
        <TextInput
          style={[styles.textInput, {
            backgroundColor: isDarkMode ? Colors.dark : Colors.light,
            borderColor: isDarkMode ? Colors.light : Colors.dark,
            color: isDarkMode ? Colors.white : Colors.black,
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
            backgroundColor: isDarkMode ? Colors.light : Colors.dark,
          }]}
          onPress={verifyCode}>
          <Text
            style={[styles.buttonText, {
              color: isDarkMode ? Colors.black : Colors.white,
            }]}>
            Verify code</Text>
        </Pressable>
      </Section>
    );
  }

  return Wrap(
    <Section title="Home">
      <Text>Welcome {user.isAnonymous ? 'Nameless' : user.phoneNumber}!</Text>
      <Pressable
        style={[styles.button, {
          backgroundColor: isDarkMode ? Colors.light : Colors.dark,
        }]}
        onPress={signOut}>
        <Text
          style={[styles.buttonText, {
            color: isDarkMode ? Colors.black : Colors.white,
          }]}>
          Sign out</Text>
      </Pressable>
    </Section>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1,
    paddingBottom: 12,
  },
  sectionContent: {
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    height: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 21,
  },
  textInput: {
    fontSize: 16,
    letterSpacing: 1,
    lineHeight: 21,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    height: 48,
    marginBottom: 12,
  },
});

export default App;
