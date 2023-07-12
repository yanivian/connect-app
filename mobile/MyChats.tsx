import React, { useContext, useState } from 'react'
import { Dimensions } from 'react-native'
import { Card, Portal, Snackbar } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext } from './Contexts'
import { ChatModel } from './Models'
import styles from './Styles'
import ChatCard from './components/ChatCard'
import { useAppDispatch, useAppSelector } from './redux/Hooks'

const ChatViewTypes = {
  FULL: 1,
}

export const MyChats = (): JSX.Element => {
  const frontendService = useContext(FrontendServiceContext)!
  const [error, setError] = useState<string>()

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  const { width } = Dimensions.get('window')
  const [dataProvider] = useState(new DataProvider((r1, r2: any) => r1 !== r2).cloneWithRows(state.Chats || []))
  const layoutProvider = new LayoutProvider(
    (index) => ChatViewTypes.FULL,
    (type, dim) => {
      switch (type) {
        case ChatViewTypes.FULL:
          dim.width = width
          dim.height = 62
          break;
        default:
          dim.width = 0
          dim.height = 0
      }
    }
  )
  const rowRenderer = (type: string | number, chat: ChatModel, index: number) => {
    switch (type) {
      case ChatViewTypes.FULL:
        return (
          <ChatCard
            key={chat.Gist.ChatID}
            chat={chat}
          />
        )
      default:
        return null
    }
  }

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
          layoutProvider={layoutProvider}
          dataProvider={dataProvider}
          rowRenderer={rowRenderer}
        />
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