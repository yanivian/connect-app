import { useEffect } from "react";
import React, { Keyboard, KeyboardMetrics } from "react-native";

interface KeyboardMetricsListenerProps {
  process: (metrics?: KeyboardMetrics) => void
}

export const KeyboardMetricsListener = (props: KeyboardMetricsListenerProps) => {
  useEffect(() => {
    const callback = () => props.process(Keyboard.metrics())

    // Subscribe to show/hide keyboard events.
    const show = Keyboard.addListener('keyboardDidShow', callback)
    const hide = Keyboard.addListener('keyboardDidHide', callback)

    return () => {
      // Unsubscribe on unmount.
      try {
        Keyboard.removeSubscription(show)
        Keyboard.removeSubscription(hide)
      } catch (ignored) {
        console.debug('Failed to remove subscriptions.')
      }
    }
  }, [])

  return (
    <></>
  )
}
