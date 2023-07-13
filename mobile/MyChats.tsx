import React, { useContext, useEffect, useState } from 'react'
import { Dimensions } from 'react-native'
import { Card, Modal, Portal, Snackbar } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { UserApiContext } from './Contexts'
import { ChatModel } from './Models'
import styles from './Styles'
import ChatCard from './components/ChatCard'
import { ChatPage, ChatPageProps } from './pages/ChatPage'
import { useAppSelector } from './redux/Hooks'

const { width } = Dimensions.get('window')

const ChatCardViewTypes = {
  ROW: 1,
}

const chatCardLayoutProvider = new LayoutProvider(
  (index) => ChatCardViewTypes.ROW,
  (type, dim) => {
    switch (type) {
      case ChatCardViewTypes.ROW:
        dim.width = width
        dim.height = 62
        break;
      default:
        dim.width = 0
        dim.height = 0
    }
  }
)

const dataProvider = new DataProvider((r1, r2: any) => r1 !== r2)

export const MyChats = (): JSX.Element => {
  const [error, setError] = useState<string>()

  const state = useAppSelector((state) => state.MyChatsSlice)

  const userApi = useContext(UserApiContext)!

  const [selectedChat, setSelectedChat] = useState<ChatPageProps | undefined>()
  function selectChat(chat: ChatModel) {
    setSelectedChat({
      chatID: chat.Gist.ChatID,
      otherParticipants: chat.Gist.Participants.filter((u) => u.UserID !== userApi.uid),
    })
  }
  function unselectChat() {
    setSelectedChat(undefined)
  }

  const [chatsDataProvider, setChatsDataProvider] = useState(dataProvider.cloneWithRows(state.Chats || []))
  const chatCardRenderer = (type: string | number, chat: ChatModel, index: number) => {
    switch (type) {
      case ChatCardViewTypes.ROW:
        return (
          <ChatCard
            key={chat.Gist.ChatID}
            chat={chat}
            selectCallback={() => selectChat(chat)}
          />
        )
      default:
        return null
    }
  }

  // Refresh the data provider when the list of chats changes.
  useEffect(() => {
    setChatsDataProvider(dataProvider.cloneWithRows(state.Chats || []))
  }, [state.Chats])

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
      <Card.Content style={{ width: '100%', height: '100%' }}>
        <RecyclerListView
          layoutProvider={chatCardLayoutProvider}
          dataProvider={chatsDataProvider}
          rowRenderer={chatCardRenderer}
        />
      </Card.Content>
      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
        <Modal
          contentContainerStyle={styles.fullscreen}
          dismissable
          onDismiss={unselectChat}
          visible={!!selectedChat}
        >
          <ChatPage
            {...selectedChat!}
            close={unselectChat}
          />
        </Modal>
      </Portal>
    </Card>
  )
}