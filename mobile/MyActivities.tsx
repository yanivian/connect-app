import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { FAB, Modal, Portal, Text } from 'react-native-paper'
import { Activity, ActivityCard, ActivityProps } from './Activity'
import { ActivityModel } from './Models'
import styles from './Styles'

const MyActivities = (): JSX.Element => {
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
    <ScrollView style={{ flexGrow: 1 }}>
      {myActivities.length === 0 &&
        <Text style={{ paddingTop: 18, textAlign: 'center' }} variant="bodyLarge">
          Create an activity to get started!
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
          visible={!!selectedActivity}
        >
          <Activity {...selectedActivity!} save={mergeMyActivity} close={closeActivity} />
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
    </ScrollView>
  )
}

export default MyActivities