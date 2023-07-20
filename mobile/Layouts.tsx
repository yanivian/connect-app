import Lottie from 'lottie-react-native'
import React, { useState } from 'react'
import { Dimensions, Platform, SafeAreaView, View } from 'react-native'
import { IconButton, Modal, Surface, Text, useTheme } from 'react-native-paper'
import { IconSource } from 'react-native-paper/src/components/Icon'
import styles from './Styles'

import type { PropsWithChildren } from 'react'
import { KeyboardMetricsListener } from './components/KeyboardMetricsListener'

type PageProps = PropsWithChildren<{
}>

export const Page = (props: PageProps) => {
  const theme = useTheme()
  const window = Dimensions.get('window')
  const [height, setHeight] = useState(window.height)

  return (
    <SafeAreaView>
      <KeyboardMetricsListener
        process={(metrics) => setHeight(window.height - (metrics?.height || 0))}
      />
      <View style={[styles.page, {
        backgroundColor: theme.colors.inverseOnSurface,
        height,
        }]}>
        {props.children}
      </View>
    </SafeAreaView>
  )
}

type FullscreenModalProps = PropsWithChildren<{
  onDismiss: () => void
  visible: boolean
}>

export const FullscreenModalPage = (props: FullscreenModalProps & PageProps) => {
  return (
    <Modal
      contentContainerStyle={styles.modal}
      dismissable
      onDismiss={props.onDismiss}
      visible={props.visible}
    >
      <Page {...props}>
        {props.children}
      </Page>
    </Modal>
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
    <View style={styles.section}>
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
    </View>
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