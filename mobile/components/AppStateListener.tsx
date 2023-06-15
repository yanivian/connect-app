import React, { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

interface AppStateListenerProps {
  onForeground?: () => void,
  onBackground?: () => void,
}

export default function AppStateListener(props: AppStateListenerProps): JSX.Element {
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        props.onForeground && props.onForeground()
      } else if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        props.onBackground && props.onBackground()
      }
      appState.current = nextAppState
    })
    return subscription.remove
  }, [])

  return <></>
}