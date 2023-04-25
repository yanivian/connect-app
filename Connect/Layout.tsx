import Lottie from 'lottie-react-native';
import React from 'react';
import {
  SafeAreaView,
  View
} from 'react-native';
import { Text } from 'react-native-paper';
import styles from './Styles';

import type { PropsWithChildren } from 'react';

type SectionPropsWithChildren = PropsWithChildren<{
  title: string;
}>;

type PagePropsWithChildren = PropsWithChildren<{
}>;

export function Section(spec: SectionPropsWithChildren): JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle} variant="titleLarge">
        {spec.title}
      </Text>
      <View style={styles.sectionContent}>
        {spec.children}
      </View>
    </View>
  );
}

export function Page(spec: PagePropsWithChildren): JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      {spec.children}
    </SafeAreaView>
  );
}

export function LoadingAnimation() {
  return (
    <View style={styles.lottieContainer}>
      <Lottie speed={.5} style={styles.lottieLoading} source={require('./images/LoadingDots.json')} autoPlay loop />
    </View>
  );
}
