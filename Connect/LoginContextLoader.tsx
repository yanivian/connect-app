import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { LoginContext, UserModelContext } from './Contexts'
import FrontendService from './FrontendService'
import { LoadingAnimation, Page, Section } from './Layouts'
import { LoginContextModel } from './Models'

type LoginContextLoaderProps = PropsWithChildren<{}>

const LoginContextLoader = (props: LoginContextLoaderProps): JSX.Element => {
  const user = useContext(UserModelContext)!
  const [loginContext, setLoginContext] = useState<LoginContextModel | null>(null)
  const [error, setError] = useState<string | null>()

  useEffect(() => {
    FrontendService.get(user).loginContext({
      client: Platform.select({
        ios: 'IOS',
        android: 'ANDROID',
        default: 'WEB',
      }),
      phoneNumber: user.phoneNumber,
    }).then(setLoginContext).catch(setError)
  }, [])

  if (!loginContext) {
    return (
      <Page>
        <Section title="Login">
          <LoadingAnimation />
        </Section>
      </Page>
    )
  }

  // Once the profile loads, show children within the context of the profile.
  return (
    <LoginContext.Provider value={loginContext}>
      {props.children}
    </LoginContext.Provider>
  )
}

export default LoginContextLoader