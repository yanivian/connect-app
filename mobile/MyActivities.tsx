import React, { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Card, FAB, Modal, Portal, Text } from 'react-native-paper'
import { Activity, ActivityCard, ActivityProps } from './Activity'
import { UserApiContext } from './Contexts'
import { ActivityModel } from './Models'
import styles from './Styles'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { addActivity, deleteActivityById, hydrate } from './redux/MyActivitiesSlice'
import { loadLocalUserData, saveLocalUserData } from './utils/LocalStorage'

const MyActivities = (): JSX.Element => {
  const userApi = useContext(UserApiContext)!

  const myActivities = useAppSelector((state) => state.MyActivitiesSlice)
  useEffect(() => {
    (async () => loadLocalUserData(userApi.uid, 'MyActivities', myActivities).then((state) => dispatch(hydrate(state))))()
  }, [])
  useEffect(() => {
    saveLocalUserData(userApi.uid, 'MyActivities', myActivities)
  }, [myActivities])

  const dispatch = useAppDispatch()
  async function createActivity(activity: ActivityModel) {
    dispatch(addActivity(activity))
  }
  async function deleteActivity(activity: ActivityModel) {
    dispatch(deleteActivityById(activity.ID))
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
          contentContainerStyle={styles.modal}
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