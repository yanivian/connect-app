import React from 'react'
import { Provider } from 'react-redux'
import Home from './Home'
import Login from './Login'
import LoginContextLoader from './LoginContextLoader'
import { store } from './redux/Store'

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <Login>
        <LoginContextLoader>
          <Home />
        </LoginContextLoader>
      </Login>
    </Provider>
  )
}