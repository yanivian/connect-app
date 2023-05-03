import Lottie from 'lottie-react-native'
import React from 'react'
import { SafeAreaView, View } from 'react-native'
import { IconButton, Surface, Text } from 'react-native-paper'
import { IconSource } from 'react-native-paper/src/components/Icon'
import styles from './Styles'

import type { PropsWithChildren } from 'react'

type PageProps = PropsWithChildren<{
}>

export const Page = (props: PageProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {props.children}
    </SafeAreaView>
  )
}

type SectionProps = PropsWithChildren<{
  title: string
  close?: {
    icon: IconSource
    callback: () => void
  }
}>

export const Section = (props: SectionProps) => {
  return (
    <Surface style={styles.section} elevation={4}>
      <View style={[styles.sectionTitle, { flexDirection: 'row', alignItems: 'center', height: 60 }]}>
        <Text style={{ flexGrow: 1 }} variant="titleLarge">
          {props.title}
        </Text>
        {props.close &&
          <IconButton
            size={20}
            mode='contained-tonal'
            icon={props.close.icon}
            onPress={props.close.callback} />
        }
      </View>
      <View style={styles.sectionContent}>
        {props.children}
      </View>
    </Surface>
  )
}

export const LoadingAnimation = () => {
  return (
    <View style={styles.lottieLoading}>
      <View>
        <Lottie speed={.5} style={styles.lottieLoading} source={require('./images/LoadingDots.json')} autoPlay loop />
      </View>
    </View>
  )
}