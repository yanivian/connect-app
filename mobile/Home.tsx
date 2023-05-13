import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Banner, Button, FAB, Portal, Text } from 'react-native-paper'
import Activity, { ActivityCard, ActivityProps } from './Activity'
import { LoginContext, ProfileModelContext, UserModelContext } from './Contexts'
import { Page, Section } from './Layouts'
import { ActivityModel } from './Models'
import Profile from './Profile'
import styles from './Styles'

enum Route {
  Activity,
  Home,
  Profile,
}

const Home = (): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!

  // State with which to override the profile available to its children.
  const [profile, setProfile] = useState(loginContext.Profile)
  const isProfileComplete = !!profile.Name && !!profile.Image

  // Update visibility state of the banner when profile completion state changes.
  useEffect(() => setShowIncompleteProfileBanner(!isProfileComplete), [isProfileComplete])

  // State capturing whether the banner for incomplete profile should be shown.
  const [showIncompleteProfileBanner, setShowIncompleteProfileBanner] = useState(false)
  // State capturing whether the Add (+) button panel is open.
  const [isAddButtonPanelOpen, setIsAddButtonPanelOpen] = useState(false)

  // State capturing the navigational stack of routes.
  const initialNavStack = [Route.Home]
  if (loginContext.IsFirstLogin) {
    initialNavStack.push(Route.Profile)
  }
  const [navStack, setNavStack] = useState<Array<Route>>(initialNavStack)

  function isCurrentRoute(route: Route) {
    return navStack[navStack.length - 1] === route
  }

  function navigateForward(next: Route) {
    const nextNavStack = []
    navStack.forEach((r) => nextNavStack.push(r))
    nextNavStack.push(next)
    setNavStack(nextNavStack)
  }

  function navigateBack() {
    if (navStack.length < 1) {
      throw new Error("Cannot navigate further back.")
    }
    const nextNavStack = []
    for (let i = 0; i < navStack.length - 1; ++i) {
      nextNavStack.push(navStack[i])
    }
    setNavStack(nextNavStack)
  }

  // State capturing my activities.
  const [myActivities, setMyActivities] = useState<Array<ActivityModel>>([])

  function mergeMyActivity(myActivity: ActivityModel) {
    const activities: Array<ActivityModel> = []
    let found = false
    for (const activity of myActivities) {
      if (activity.ID === myActivity.ID) {
        activities.push(myActivity)
        found = true
      } else {
        activities.push(activity)
      }
    }
    if (!found) {
      activities.push(myActivity)
    }
    setMyActivities(activities)
  }

  function deleteActivity(activityID: string) {
    const activities: Array<ActivityModel> = []
    for (const activity of myActivities) {
      if (activity.ID !== activityID) {
        activities.push(activity)
      }
    }
    setMyActivities(activities)
  }

  // State capturing a selected activity.
  const [selectedActivity, setSelectedActivity] = useState<ActivityProps>()

  function closeActivity() {
    setSelectedActivity(undefined)
    navigateBack()
  }

  return (
    <ProfileModelContext.Provider value={profile}>
      <Page>
        {/* Home route */}
        {isCurrentRoute(Route.Home) &&
          <Section title="Home">
            <Text style={[styles.text, { marginBottom: 12 }]} variant="bodyLarge">
              Welcome {profile.Name || profile.PhoneNumber || 'Nameless'}!
            </Text>
            <Banner
              visible={showIncompleteProfileBanner}
              elevation={4}
              style={{ marginBottom: 12 }}
              actions={[
                {
                  label: 'Close',
                  onPress: () => setShowIncompleteProfileBanner(false),
                },
                {
                  label: 'Fix it',
                  onPress: () => navigateForward(Route.Profile),
                },
              ]}
              icon="alert-circle-outline">
              Your profile is incomplete. Please pick a name and avatar.
            </Banner>
            {myActivities.length === 0 &&
              <Text style={styles.text} variant="bodyLarge">
                This is where you will see your activities, once you create them.
              </Text>
            }
            {myActivities.map((thisActivity) => {
              return (
                <ActivityCard
                  key={thisActivity.ID}
                  activity={thisActivity}
                  cloneActivity={(activity) => {
                    setSelectedActivity({
                      activity,
                      clone: true,
                    })
                    navigateForward(Route.Activity)
                  }}
                  deleteActivity={(activity) => deleteActivity(activity.ID)}
                  editActivity={(activity) => {
                    setSelectedActivity({
                      activity,
                      clone: false,
                    })
                    navigateForward(Route.Activity)
                  }} />

              )
            })}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginEnd: 12 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={() => navigateForward(Route.Profile)}>
                  Profile
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button style={styles.button} labelStyle={[styles.buttonLabel]} mode="contained-tonal" onPress={user.signOut}>
                  Sign out
                </Button>
              </View>
            </View>
            <Portal>
              <FAB.Group
                open={isAddButtonPanelOpen}
                visible
                icon={isAddButtonPanelOpen ? 'minus' : 'plus'}
                actions={[
                  {
                    icon: 'run',
                    label: 'Activity',
                    onPress: () => {
                      setSelectedActivity({})
                      navigateForward(Route.Activity)
                    },
                  },
                ]}
                onStateChange={({ open }) => setIsAddButtonPanelOpen(open)} />
            </Portal>
          </Section>
        }

        {/* Profile route */}
        {isCurrentRoute(Route.Profile) &&
          <Profile
            setProfile={(updatedProfile) => {
              setProfile(updatedProfile)
              navigateBack()
            }}
            close={navigateBack} />
        }

        {/* Activity route */}
        {isCurrentRoute(Route.Activity) &&
          <Activity {...selectedActivity!} save={mergeMyActivity} close={closeActivity} />
        }
      </Page>
    </ProfileModelContext.Provider>
  )
}

export default Home