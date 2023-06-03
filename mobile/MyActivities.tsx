import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { Card, FAB, Modal, Portal, Text } from 'react-native-paper'
import { Activity, ActivityCard, ActivityProps } from './Activity'
import { ActivityModel } from './Models'
import { delayedPromise, useMutatingState } from './React'
import styles from './Styles'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { addActivity, deleteActivityById } from './redux/MyActivitiesSlice'

const MyActivities = (): JSX.Element => {
  const myActivities = useAppSelector((state) => state.MyActivitiesSlice)
  const dispatch = useAppDispatch()

  // State capturing my activities.
  const [creating, creatingRef, setCreating] = useMutatingState<Array<ActivityModel>>([])
  const [deleting, deletingRef, setDeleting] = useMutatingState<Array<ActivityModel>>([])

  async function createActivity(activity: ActivityModel) {
    setCreating([...creatingRef.current, activity])
    dispatch(addActivity(activity))
    return delayedPromise(3000, undefined)
      .then(() => {
        setCreating(creatingRef.current.filter((a) => a !== activity))
      })
  }

  async function deleteActivity(activity: ActivityModel) {
    setDeleting([...deletingRef.current, activity])
    dispatch(deleteActivityById(activity.ID))
    return delayedPromise(3000, undefined)
      .then(() => {
        setDeleting(deletingRef.current.filter((a) => a !== activity))
      })
  }

  // State capturing a selected activity.
  const [selectedActivity, setSelectedActivity] = useState<ActivityProps>()

  function closeActivity() {
    setSelectedActivity(undefined)
  }

  return (
    <ScrollView style={{ flex: 1, flexGrow: 1 }}>
      {myActivities.created.length === 0 &&
        <Text style={{ paddingTop: 18, textAlign: 'center' }} variant="bodyLarge">
          Create an activity to get started!
        </Text>
      }
      {myActivities.created.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            flex: 1,
            flexGrow: 1,
          }}
        >
          <Card.Title title='My Activities' titleVariant='titleMedium' />
          <Card.Content>
            {myActivities.created.map((thisActivity) => {
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
                  deleteActivity={deleteActivity}
                  editActivity={(activity) => {
                    setSelectedActivity({
                      activity,
                      clone: false,
                    })
                  }}
                />
              )
            })}
          </Card.Content>
        </Card>
      }
      <Portal>
        <Modal
          contentContainerStyle={styles.fullscreen}
          onDismiss={closeActivity}
          visible={!!selectedActivity}
        >
          <Activity {...selectedActivity!} save={createActivity} close={closeActivity} />
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