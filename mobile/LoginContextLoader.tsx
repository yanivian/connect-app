import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { FrontendServiceContext, UserApiContext } from './Contexts'
import { LoadingAnimation, Page, Section } from './Layouts'
import { useAppDispatch } from './redux/Hooks'
import { setLoginContext as setReduxLoginContext } from './redux/LoginSlice'
import { refreshChats } from './redux/MyChatsSlice'
import { hydrate } from './redux/MyConnectionsSlice'
import { setProfile } from './redux/ProfileSlice'

type LoginContextLoaderProps = PropsWithChildren<{}>

const LoginContextLoader = (props: LoginContextLoaderProps): JSX.Element => {
  const frontendService = useContext(FrontendServiceContext)!
  const userApi = useContext(UserApiContext)!
  const [ready, setReady] = useState(false)
  // TODO: Render error.
  const [error, setError] = useState<string | null>()

  // Redux action dispatcher.
  const dispatch = useAppDispatch()

  useEffect(() => {
    frontendService.loginContext({
      phoneNumber: userApi.phoneNumber,
    }).then((loginContext) => {
      // Update redux initial state.
      dispatch(setReduxLoginContext(loginContext))
      dispatch(refreshChats(loginContext.ChatsSnapshot))
      dispatch(hydrate(loginContext.ConnectionsSnapshot))
      dispatch(setProfile(loginContext.Profile))
    }).then(() => setReady(true))
      .catch(setError)
  }, [])

  if (!ready) {
    // TODO: Improve first-time loading screen.
    return (
      <Page>
        <Section title="Login">
          <LoadingAnimation />
        </Section>
      </Page>
    )
  }

  // Render children.
  return <>{props.children}</>
}

export default LoginContextLoader