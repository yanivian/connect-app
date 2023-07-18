import { useEffect } from "react";
import React, { Keyboard, KeyboardMetrics } from "react-native";

interface KeyboardMetricsListenerProps {
  process: (metrics?: KeyboardMetrics) => void
}

export const KeyboardMetricsListener = (props: KeyboardMetricsListenerProps) => {
  useEffect(() => {
    const callback = () => props.process(Keyboard.metrics())

    // Subscribe to show/hide keyboard events.
    Keyboard.addListener('keyboardDidShow', callback)
    Keyboard.addListener('keyboardDidHide', callback)

    // TODO: Unsubscribe from events.
  }, [])

  return (
    <></>
  )
}
