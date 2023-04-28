import React, { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { ProfileModelContext, UserModelContext } from './Contexts'
import FrontendService from './FrontendService'
import { LoadingAnimation, Page, Section } from './Layouts'
import { ProfileModel } from './Models'

type ProfileLoaderProps = PropsWithChildren<{}>

const ProfileLoader = (props: ProfileLoaderProps): JSX.Element => {
  const user = useContext(UserModelContext)!
  const [profile, setProfile] = useState<ProfileModel | null>(null)
  const [error, setError] = useState<string | null>()

  useEffect(() => {
    FrontendService.get(user).getOrCreateProfile({
      phoneNumber: user.phoneNumber,
    }).then(setProfile).catch(setError)
  }, [])

  // While the profile is loading, we pretend to still be logging the user in.
  if (!profile) {
    return (
      <Page>
        <Section title="Login">
          <LoadingAnimation />
        </Section>
      </Page>
    )
  }

  // Once the profile loads, how children within the context of the profile.
  return (
    <ProfileModelContext.Provider value={profile}>
      {props.children}
    </ProfileModelContext.Provider>
  )
}

export default ProfileLoader