import Lottie from 'lottie-react-native'
import React from 'react'
import { SafeAreaView, View } from 'react-native'
import { Surface, Text } from 'react-native-paper'
import styles from './Styles'

import type { PropsWithChildren } from 'react'

type SectionPropsWithChildren = PropsWithChildren<{
  title: string,
}>

type PagePropsWithChildren = PropsWithChildren<{
}>

export function Section(spec: SectionPropsWithChildren): JSX.Element {
  return (
    <Surface style={styles.section} elevation={4}>
      <Text style={styles.sectionTitle} variant="titleLarge">
        {spec.title}
      </Text>
      <View style={styles.sectionContent}>
        {spec.children}
      </View>
    </Surface>
  )
}

export function Page(spec: PagePropsWithChildren): JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      {spec.children}
    </SafeAreaView>
  )
}

export function LoadingAnimation(): JSX.Element {
  return (
    <View style={styles.lottieLoading}>
      <View>
        <Lottie speed={.5} style={styles.lottieLoading} source={require('./images/LoadingDots.json')} autoPlay loop />
      </View>
    </View>
  )
}
