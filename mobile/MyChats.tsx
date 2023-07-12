import React, { useContext, useState } from 'react'
import { ScrollView } from 'react-native'
import { Card, Portal, Snackbar } from 'react-native-paper'
import { FrontendServiceContext } from './Contexts'
import styles from './Styles'
import ChatCard from './components/ChatCard'
import { useAppDispatch, useAppSelector } from './redux/Hooks'

export const MyChats = (): JSX.Element => {
  const frontendService = useContext(FrontendServiceContext)!
  const [error, setError] = useState<string>()

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  return (

    <Card
      mode='outlined'
      style={{
        backgroundColor: 'transparent',
        flex: 1,
        flexGrow: 1,
        marginBottom: 70,
      }}
    >
      <Card.Content>
        <ScrollView>
          {
            state.Chats && state.Chats.map((chat) => {
              return (
                <ChatCard
                  key={chat.Gist.ChatID}
                  chat={chat}
                />
              )
            })
          }
        </ScrollView>
      </Card.Content>
      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </Card>
  )
}