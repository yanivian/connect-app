import React, { useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { ActivityIndicator, Card, Divider, IconButton, Portal, Snackbar, TextInput, useTheme } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Page, Section } from '../Layouts'
import { ChatMessageModel, ChatModel, UserInfo } from '../Models'
import styles from '../Styles'
import ChatMessageCard from '../components/ChatMessageCard'
import { useAppDispatch, useAppSelector } from '../redux/Hooks'
import { incorporateChat } from '../redux/MyChatsSlice'
import { summarizeParticipants } from '../utils/ChatUtils'

export interface ChatPageProps {
  chatID?: string
  otherParticipants: Array<UserInfo>
}

const { width } = Dimensions.get('window')

const ChatMessageCardViewTypes = {
  ROW: 1,
}

const chatMessageCardLayoutProvider = new LayoutProvider(
  (index) => ChatMessageCardViewTypes.ROW,
  (type, dim) => {
    switch (type) {
      case ChatMessageCardViewTypes.ROW:
        dim.width = width
        dim.height = 54
        break;
      default:
        dim.width = 0
        dim.height = 0
    }
  }
)

const dataProvider = new DataProvider((r1, r2: any) => r1 !== r2)

function findChatByID(chatID: string, list: Array<ChatModel>): ChatModel | undefined {
  const matches = list.filter((c) => c.Gist.ChatID === chatID)
  return matches && matches[0]
}

export function ChatPage(props: ChatPageProps & {
  close: () => void
}): JSX.Element {
  const theme = useTheme()
  const [error, setError] = useState<string | null>()

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  const userApi = useContext(UserApiContext)!
  const otherParticipantUserIDs = props.otherParticipants && props.otherParticipants.map((u) => u.UserID)

  const frontendService = useContext(FrontendServiceContext)!

  const [chatID, setChatID] = useState(props.chatID)
  let chat = chatID && state.Chats && findChatByID(chatID, state.Chats) || undefined

  const [refreshing, setRefreshing] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  // Fetch chat messages from server if needed.
  useEffect(() => {
    (async () => {
      if (!chatID) {
        return
      }
      setRefreshing(true)
      dispatch(incorporateChat(await frontendService.listChatMessages(chatID)))
      setRefreshing(false)
      scrollToEnd()
    })()
  }, [])

  async function postChatMessage() {
    // TODO: Handle the case of more than one target user.
    const targetUserID = otherParticipantUserIDs && otherParticipantUserIDs[0] || userApi.uid
    setSending(true)
    chat = await frontendService.postChatMessage(targetUserID, text || undefined)
    if (!chatID) {
      setChatID(chat.Gist.ChatID)
    }
    dispatch(incorporateChat(chat))
    setText('')
    setSending(false)
    scrollToEnd()
  }

  const chatMessagesRecyclerListView = useRef<any>()
  const [chatMessagesDataProvider, setChatMessagesDataProvider] = useState(dataProvider.cloneWithRows(chat?.Messages || []))
  const chatMessageCardRenderer = (type: string | number, message: ChatMessageModel, index: number) => {
    switch (type) {
      case ChatMessageCardViewTypes.ROW:
        return (
          <ChatMessageCard
            key={message.MessageID}
            message={message}
            numOtherParticipants={props.otherParticipants.length}
          />
        )
      default:
        return null
    }
  }

  // Refresh the data provider when the chat changes.
  useEffect(() => {
    setChatMessagesDataProvider(dataProvider.cloneWithRows(chat?.Messages || []))
  }, [chat])

  function scrollToEnd() {
    (chatMessagesRecyclerListView.current! as RecyclerListView<any, any>).scrollToEnd(true)
  }

  return (
    <Page>
      <Section
        title={summarizeParticipants(props.otherParticipants)}
        actions={[{
          label: 'Close',
          icon: 'close',
          callback: props.close,
        }]}
      >
        <View style={{
          flex: 1,
          flexGrow: 1,
          flexDirection: 'column',
          paddingBottom: 70,
        }}>
          <Card
            mode='outlined'
            style={{
              flex: 1,
              flexGrow: 1,
              backgroundColor: 'transparent',
            }}
          >
            <Card.Content style={{ width: '100%', height: '100%' }}>
              <RecyclerListView
                layoutProvider={chatMessageCardLayoutProvider}
                dataProvider={chatMessagesDataProvider}
                ref={chatMessagesRecyclerListView}
                rowRenderer={chatMessageCardRenderer}
              />
              {refreshing &&
                <ActivityIndicator animating={true} size='small' />
              }
              <Divider />
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <TextInput
                  style={{ flex: 1, flexGrow: 1, backgroundColor: 'transparent' }}
                  contentStyle={{ textAlignVertical: 'center' }}
                  mode='flat'
                  value={text}
                  multiline={true}
                  numberOfLines={2}
                  onChangeText={setText}
                  placeholder='Message'
                  inputMode='text'
                  disabled={sending}
                  error={!!error}
                />
                <View style={{ alignItems: 'flex-end' }}>
                  {!sending &&
                    <IconButton
                      icon='send'
                      iconColor={theme.colors.primary}
                      onPress={async (e) => postChatMessage()}
                      style={{ margin: 0 }}
                    />
                  }
                  {sending &&
                    <ActivityIndicator animating={true} size='small' />
                  }
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Section>
      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </Page>
  )
}