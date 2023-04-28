import React from 'react'
import Home from './Home'
import Login from './Login'
import ProfileLoader from './ProfileLoader'

export default function App(): JSX.Element {
  return (
    <Login>
      <ProfileLoader>
        <Home />
      </ProfileLoader>
    </Login>
  )
}