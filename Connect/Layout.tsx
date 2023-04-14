import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import styles from './Styles';
import { Colors } from "react-native/Libraries/NewAppScreen";

import type { PropsWithChildren } from 'react';

type SectionPropsWithChildren = PropsWithChildren<{
  isDarkMode: boolean;
  title: string;
}>;

type PagePropsWithChildren = PropsWithChildren<{
  isDarkMode: boolean;
}>;

export function Section(spec: SectionPropsWithChildren): JSX.Element {
  return (
    <View style={[styles.sectionContainer,
    {
      backgroundColor: spec.isDarkMode ? Colors.darker : Colors.lighter,
    }]}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: spec.isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {spec.title}
      </Text>
      <View style={styles.sectionContent}>
        {spec.children}
      </View>
    </View>
  );
}

export function Page(spec: PagePropsWithChildren): JSX.Element {
  const backgroundStyle = {
    backgroundColor: spec.isDarkMode ? Colors.dark : Colors.light,
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        {spec.children}
      </ScrollView>
    </SafeAreaView>
  );
}