import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { UserApiContext } from './Contexts'
import FrontendService from './FrontendService'
import { LoadingAnimation, Page, Section } from './Layouts'
import { LoginContextModel } from './Models'
import { useAppDispatch } from './redux/Hooks'
import { setLoginContext as setReduxLoginContext } from './redux/LoginSlice'

type LoginContextLoaderProps = PropsWithChildren<{}>

const LoginContextLoader = (props: LoginContextLoaderProps): JSX.Element => {
  const userApi = useContext(UserApiContext)!
  const [loginContext, setLoginContext] = useState<LoginContextModel | null>(null)
  const [error, setError] = useState<string | null>()

  // Redux action dispatcher.
  const dispatch = useAppDispatch()

  useEffect(() => {
    FrontendService.get(userApi).loginContext({
      phoneNumber: userApi.phoneNumber,
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
  dispatch(setReduxLoginContext(loginContext))
  return (
    <>
      {props.children}
    </>
  )
}

export default LoginContextLoader