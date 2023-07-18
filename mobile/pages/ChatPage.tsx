import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { ActivityIndicator, Divider, IconButton, Portal, Snackbar, Text, TextInput, useTheme } from 'react-native-paper'
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Section } from '../Layouts'
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

const ChatMessageCardViewTypes = {
  ROW: 1,
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
  const otherParticipantUserIDs = props.otherParticipants.map((u) => u.UserID)

  const frontendService = useContext(FrontendServiceContext)!

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  const [chatID, setChatID] = useState(props.chatID)
  const [chat, setChat] = useState<ChatModel>()

  const chatMessageCardLayoutProvider = new LayoutProvider(
    (index) => ChatMessageCardViewTypes.ROW,
    (type, dim, index) => {
      const message = chat?.Messages[index]
      if (type !== ChatMessageCardViewTypes.ROW || !message) {
        dim.height = 0
        dim.width = 0
        return
      }
      let numRows = (props.otherParticipants.length > 1) ? 1 : 0
      if (!message.Text) {
        numRows += 1
      } else {
        // TODO: Use device pixel ratio, currently estimates 30 characters per line.
        numRows += message.Text.split('\n')
          .map(line => 1 + Math.floor(line.length / 30))
          .reduce((prev, curr) => prev + curr)
      }
      dim.height = 15 + Math.max(1, numRows) * 24
      dim.width = width
    }
  )

  const [locked, setLocked] = useState(false)
  const [text, setText] = useState('')

  const updateChatState = useCallback((update: ChatModel) => {
    if (!chatID) {
      setChatID(update.Gist.ChatID)
    }
    if (chat && chat.Gist.TimestampMillis >= update.Gist.TimestampMillis) {
      return
    }
    setChat(update)
    dispatch(incorporateChat(update))
  }, [chatID, chat])

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
  }, 750), [chatID])

  const setDraftText = useCallback(async (draftText: string) => {
    setText(draftText)
    if (locked) {
      return
    }
    await setDraftTextCallback({
      clearText: !draftText || undefined,
      setText: draftText || undefined,
    })
  }, [locked])

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
    })()
  }, [chatID])

  // Signal the last seen message ID to server when the chat changes.
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

  // Post a text message.
  const postChatMessage = useCallback(async () => {
    setLocked(true)
    await cancelDraftsInProgress()
    setText('')
    // TODO: Handle the case of more than one target user.
    const targetUserID = otherParticipantUserIDs[0]
    updateChatState(await frontendService.postChatMessage(targetUserID, text))
    setLocked(false)
  }, [text])

  const chatMessagesRecyclerListView = useRef<any>()
  const [chatMessagesDataProvider, setChatMessagesDataProvider] = useState<DataProvider>()
  const chatMessageCardRenderer = (type: string | number, message: ChatMessageModel) => {
    if (type !== ChatMessageCardViewTypes.ROW) {
      return null
    }
    return (
      <ChatMessageCard
        key={message.MessageID}
        message={message}
        numOtherParticipants={props.otherParticipants.length}
      />
    )
  }

  // Refresh the data provider when the chat changes.
  useEffect(() => {
    const refresh = chatID && state.Chats && findChatByID(chatID, state.Chats) || undefined
    if (!refresh) {
      return
    }
    setChat(refresh)
    setText(refresh.Gist.DraftText || '')
    setChatMessagesDataProvider(dataProvider.cloneWithRows(refresh.Messages || []))
  }, [chatID, state.Chats])

  return (
    <Section
      title={summarizeParticipants(props.otherParticipants)}
      actions={[{
        label: 'Close',
        icon: 'close',
        callback: props.close,
      }]}
    >
      <View
        style={{
          flex: 1,
          flexGrow: 1,
          backgroundColor: 'transparent',
        }}
      >
        {chat && chatMessagesDataProvider &&
          <RecyclerListView
            layoutProvider={chatMessageCardLayoutProvider}
            dataProvider={chatMessagesDataProvider}
            ref={chatMessagesRecyclerListView}
            rowRenderer={chatMessageCardRenderer}
            scrollViewProps={{ paddingTop: 5, transform: [{ scaleY: -1 }] }}
          />
        }
        {chat?.Gist.TypingUsers &&
          <Text numberOfLines={2} style={{ fontStyle: 'italic', marginVertical: 9, textAlign: 'center' }} variant='bodySmall'>
            {summarizeTypingUsers(chat.Gist.TypingUsers, userApi.uid)}
          </Text>
        }
        {!chat &&
          <View
            style={{
              flexGrow: 1,
              backgroundColor: 'transparent',
            }}
          />
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
      </View>
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