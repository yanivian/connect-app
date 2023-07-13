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
    <SafeAreaView>
      <View style={styles.page}>
        {props.children}
      </View>
    </SafeAreaView>
  )
}

type SectionProps = PropsWithChildren<{
  title: string
  actions?: Array<{
    icon: IconSource
    label: string
    callback: () => void
  }>
}>

export const Section = (props: SectionProps) => {
  return (
    <Surface style={styles.section} elevation={4}>
      <View style={styles.sectionTitle}>
        <Text numberOfLines={1} style={{ flex: 1, flexGrow: 1 }} variant="headlineSmall">
          {props.title}
        </Text>
        {props.actions &&
          props.actions.map((action, actionIdx) => {
            return (
              <IconButton
                aria-label={action.label}
                icon={action.icon}
                key={actionIdx}
                mode='contained-tonal'
                onPress={action.callback}
                size={20}
                style={{ marginLeft: 6 }}
              />
            )
          })
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