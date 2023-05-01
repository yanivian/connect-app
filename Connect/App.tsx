import React from 'react'
import Home from './Home'
import Login from './Login'
import LoginContextLoader from './LoginContextLoader'

export default function App(): JSX.Element {
  return (
    <Login>
      <LoginContextLoader>
        <Home />
      </LoginContextLoader>
    </Login>
  )
}