import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { ActivityIndicator, Card, Divider, IconButton, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Section } from '../Layouts'
import { ChatMessageModel, ChatModel, UserInfo } from '../Models'
import styles from '../Styles'
import ChatMessageCard from '../components/ChatMessageCard'
import { KeyboardMetricsListener } from '../components/KeyboardMetricsListener'
import { useAppDispatch, useAppSelector } from '../redux/Hooks'
import { incorporateChat } from '../redux/MyChatsSlice'
import { summarizeParticipants, summarizeTypingUsers } from '../utils/ChatUtils'

export interface ChatPageProps {
  chatID?: string
  otherParticipants: Array<UserInfo>
}

interface DraftMessage {
  clearText?: boolean
  setText?: string
}

const { width } = Dimensions.get('window')


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

  const userApi = useContext(UserApiContext)!
  const otherParticipantUserIDs = props.otherParticipants && props.otherParticipants.map((u) => u.UserID)

  const frontendService = useContext(FrontendServiceContext)!

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  const [chatID, setChatID] = useState(props.chatID)
  const [chat, setChat] = useState<ChatModel>()

  const chatMessageCardLayoutProvider = new LayoutProvider(
    (index) => {
      const message = chat?.Messages[index]
      if (message && message.Text) {
        const baseNumLines = (chat.Gist.Participants.length > 2) ? 1 : 0
        return Math.max(2, baseNumLines + message.Text.length / 18)
      }
      return 2
    },
    (numRows, dim) => {
      dim.width = width
      dim.height = Number(numRows) * 24
    }
  )

  const [locked, setLocked] = useState(false)
  const [text, setText] = useState('')

  const updateChatState = useCallback((chat: ChatModel) => {
    if (!chatID) {
      setChatID(chat.Gist.ChatID)
    }
    setChat(chat)
    dispatch(incorporateChat(chat))
  }, [])

  const setDraftTextCallback = useCallback(debounce(async (draft?: DraftMessage) => {
    if (!chatID) {
      return
    }
    if (!draft) {
      return
    }
    updateChatState(await frontendService.updateChat({
      chatID,
      clearDraftText: draft.clearText,
      setDraftText: draft.setText,
    }))
  }, 750), [])

  async function setDraftText(value: string) {
    setText(value)
    if (locked) {
      return
    }
    await setDraftTextCallback({
      clearText: !value || undefined,
      setText: value || undefined,
    })
  }

  async function cancelDraftsInProgress() {
    await setDraftTextCallback(undefined)
  }

  // Fetch chat messages from server if needed.
  useEffect(() => {
    (async () => {
      if (!chatID) {
        return
      }
      setLocked(true)
      updateChatState(await frontendService.listChatMessages(chatID))
      setLocked(false)
      scrollToEnd(true)
    })()
  }, [chatID])

  // Signal the last seen message ID to server when needed.
  useEffect(() => {
    (async () => {
      if (!chatID || !chat) {
        return
      }
      const lastSeenMessageID = Math.max(...chat.Messages.map(m => m.MessageID))
      if (lastSeenMessageID > (chat.Gist.LastSeenMessageID || 0)) {
        updateChatState(await frontendService.updateChat({
          chatID,
          lastSeenMessageID,
        }))
      }
    })()
  }, [chat])

  async function postChatMessage() {
    setLocked(true)
    await cancelDraftsInProgress()
    setText('')
    // TODO: Handle the case of more than one target user.
    const targetUserID = otherParticipantUserIDs && otherParticipantUserIDs[0] || userApi.uid
    updateChatState(await frontendService.postChatMessage(targetUserID, text))
    setLocked(false)
  }

  const chatMessagesRecyclerListView = useRef<any>()
  const [chatMessagesDataProvider, setChatMessagesDataProvider] = useState(dataProvider.cloneWithRows(chat?.Messages || []))
  const chatMessageCardRenderer = (numRows: string | number, message: ChatMessageModel, index: number) => {
    return (
      <ChatMessageCard
        key={message.MessageID}
        message={message}
        numOtherParticipants={props.otherParticipants?.length || 0}
      />
    )
  }

  // Refresh the data provider when the chat changes.
  useEffect(() => {
    const updatedChat = chatID && state.Chats && findChatByID(chatID, state.Chats) || undefined
    setChat(updatedChat)
    !text && setText(updatedChat?.Gist.DraftText || '')
    setChatMessagesDataProvider(dataProvider.cloneWithRows(updatedChat?.Messages || []))
    scrollToEnd(true)
  }, [chatID, state.Chats])

  function scrollToEnd(animate?: boolean) {
    if (!chat || chat.Messages.length < 2) {
      return
    }
    const view = (chatMessagesRecyclerListView.current! as RecyclerListView<any, any>)
    view.scrollToEnd(animate)
  }

  return (
    <Section
      title={summarizeParticipants(props.otherParticipants)}
      actions={[{
        label: 'Close',
        icon: 'close',
        callback: props.close,
      }]}
    >
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
          <KeyboardMetricsListener
            process={() => chatMessagesDataProvider.getSize() > 0 && chatMessagesRecyclerListView.current && scrollToEnd(true)}
          />
          {chat && chat.Gist.TypingUsers &&
            <Text numberOfLines={2} style={{ fontStyle: 'italic', marginVertical: 9, textAlign: 'center' }} variant='bodySmall'>
              {summarizeTypingUsers(chat.Gist.TypingUsers, userApi.uid)}
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
              error={!!error}
            />
            <View style={{ alignItems: 'flex-end' }}>
              {!locked &&
                <IconButton
                  icon='send'
                  iconColor={theme.colors.primary}
                  onPress={async (e) => postChatMessage()}
                  style={{ margin: 0 }}
                  disabled={!text}
                />
              }
              {locked &&
                <ActivityIndicator animating={true} size='small' />
              }
            </View>
          </View>
        </Card.Content>
      </Card>
      <Portal>
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </Section>
  )
}