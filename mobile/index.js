import { AppRegistry } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import 'react-native-url-polyfill/auto'
import App from './App'
import { name as appName } from './app.json'

export default function Main({ isHeadless }) {
  if (isHeadless) {
    // iOS app launched in the background, avoid side-effects by not rendering.
    return null
  }
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  )
}

AppRegistry.registerComponent(appName, () => Main)