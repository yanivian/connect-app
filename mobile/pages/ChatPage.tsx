import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { ActivityIndicator, Card, Divider, IconButton, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Page, Section } from '../Layouts'
import { ChatMessageModel, ChatModel, UserInfo } from '../Models'
import styles from '../Styles'
import ChatMessageCard from '../components/ChatMessageCard'
import { useAppDispatch, useAppSelector } from '../redux/Hooks'
import { incorporateChat } from '../redux/MyChatsSlice'
import { summarizeParticipants, summarizeTypingUsers } from '../utils/ChatUtils'

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
  const [chat, setChat] = useState<ChatModel>()

  const [locked, setLocked] = useState(false)
  const [text, setText] = useState('')

  const setDraftTextCallback = useCallback(debounce(async (value: string) => {
    const result = await frontendService.updateChat(chatID!, undefined, value)
    dispatch(incorporateChat(result))
  }, 1_500), [])

  async function setDraftText(value: string) {
    setText(value)
    setDraftTextCallback(value)
  }

  // Fetch chat messages from server if needed.
  useEffect(() => {
    (async () => {
      if (!chatID) {
        return
      }
      setLocked(true)
      dispatch(incorporateChat(await frontendService.listChatMessages(chatID)))
      setLocked(false)
      scrollToEnd(true)
    })()
  }, [chatID])

  // Signal the last seen message ID to server when needed.
  useEffect(() => {
    (async () => {
      if (!chat) {
        return
      }
      const lastSeenMessageID = Math.max(...chat.Messages.map(m => m.MessageID))
      if (lastSeenMessageID > (chat.Gist.LastSeenMessageID || 0)) {
        dispatch(incorporateChat(await frontendService.updateChat(chatID!, lastSeenMessageID, undefined)))
      }
    })()
  }, [chat])

  async function postChatMessage() {
    // TODO: Handle the case of more than one target user.
    const targetUserID = otherParticipantUserIDs && otherParticipantUserIDs[0] || userApi.uid
    setLocked(true)

    const fresherChat = await frontendService.postChatMessage(targetUserID, text || undefined)
    if (!chatID) {
      setChatID(fresherChat.Gist.ChatID)
    }
    dispatch(incorporateChat(fresherChat))
    setDraftText('')
    setLocked(false)
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
    const updatedChat = chatID && state.Chats && findChatByID(chatID, state.Chats) || undefined
    setChat(updatedChat)
    !text && setText(updatedChat?.Gist.DraftText || '')
    setChatMessagesDataProvider(dataProvider.cloneWithRows(updatedChat?.Messages || []))
    if (!!chat) {
      scrollToEnd(true)
    }
  }, [chatID, state.Chats])

  function scrollToEnd(animate?: boolean) {
    (chatMessagesRecyclerListView.current! as RecyclerListView<any, any>).scrollToEnd(animate)
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
              {chat && chat.Gist.TypingUsers &&
                <Text numberOfLines={2} style={{ fontStyle: 'italic', marginVertical: 9, textAlign: 'center' }} variant='bodySmall'>
                  {summarizeTypingUsers(chat.Gist.TypingUsers)}
                  {chat.Gist.TypingUsers.length > 1 ? ' are typing.' : ' is typing.'}
                </Text>
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
                  onChangeText={setDraftText}
                  placeholder='Message'
                  inputMode='text'
                  disabled={locked}
                  error={!!error}
                />
                <View style={{ alignItems: 'flex-end' }}>
                  {!locked &&
                    <IconButton
                      icon='send'
                      iconColor={theme.colors.primary}
                      onPress={async (e) => postChatMessage()}
                      style={{ margin: 0 }}
                    />
                  }
                  {locked &&
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