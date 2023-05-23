import React, { useContext, useState } from 'react'
import { View } from 'react-native'
import { FAB, Modal, Portal, Text, useTheme } from 'react-native-paper'
import { Activity, ActivityCard, ActivityProps } from './Activity'
import { LoginContext, UserModelContext } from './Contexts'
import { ActivityModel } from './Models'
import styles from './Styles'

const MyActivities = (): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!
  const theme = useTheme()

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
  }
  return (
    <View>
      {myActivities.length === 0 &&
        <Text style={styles.text} variant="bodyLarge">
          You will find the activities you create here. Get started by creating one now.
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
            }}
            deleteActivity={(activity) => deleteActivity(activity.ID)}
            editActivity={(activity) => {
              setSelectedActivity({
                activity,
                clone: false,
              })
            }} />
        )
      })}
      <Portal>
        <Modal
          contentContainerStyle={styles.fullscreen}
          onDismiss={closeActivity}
          theme={{ colors: { backdrop: 'transparent' } }}
          visible={!!selectedActivity}
        >
          <LoginContext.Provider value={loginContext}>
            <Activity {...selectedActivity!} save={mergeMyActivity} close={closeActivity} />
          </LoginContext.Provider>
        </Modal>
        <FAB
          aria-label='Add an activity'
          icon='plus'
          onPress={() => {
            setSelectedActivity({})
          }}
          style={styles.fab}
          visible={!selectedActivity}
        />
      </Portal>
    </View>
  )
}

export default MyActivities