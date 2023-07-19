import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'
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
import { findChatByID, findChatByParticipants, summarizeParticipants, summarizeTypingUsers } from '../utils/ChatUtils'
import { compareChatMessages } from '../utils/CompareUtils'
import { profileToUser } from '../utils/UserUtils'

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

export function ChatPage(props: ChatPageProps & {
  close: () => void
}): JSX.Element {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const userApi = useContext(UserApiContext)!
  const frontendService = useContext(FrontendServiceContext)!

  const profile = useAppSelector((state) => state.ProfileSlice.profile!)
  const [thisUser] = useState(profileToUser(profile))

  const [error, setError] = useState<string | null>()

  const myChatsSlice = useAppSelector((state) => state.MyChatsSlice)

  const [chatID, setChatID] = useState(props.chatID)
  const [chat, setChat] = useState<ChatModel>()

  const [chatMessagesDataProvider, setChatMessagesDataProvider] = useState<DataProvider>()

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
    (async () => {
      if (!myChatsSlice.Chats) {
        return
      }
      let localChat: ChatModel | undefined
      if (chatID) {
        localChat = findChatByID(chatID, myChatsSlice.Chats)
      }
      if (!localChat) {
        localChat = findChatByParticipants([thisUser, ...props.otherParticipants], myChatsSlice.Chats)
        if (localChat) {
          setChatID(localChat.Gist.ChatID)
        }
      }
      if (localChat) {
        refreshChat(localChat)
      }
      setChatMessagesDataProvider(dataProvider.cloneWithRows(localChat.Messages || []))
    })()
  }, [chatID, myChatsSlice])

  const updateChatState = useCallback((update: ChatModel) => {
    if (chatID !== update.Gist.ChatID) {
      setChatID(update.Gist.ChatID)
    }
    dispatch(incorporateChat(update))
  }, [chat, chatID])

  const [locked, setLocked] = useState(false)
  const [text, setText] = useState('')

  const refreshChat = useCallback(async (refresh: ChatModel) => {
    setChat(refresh)
    if (!text) {
      setText(refresh.Gist.DraftText || '')
    }
    if (compareChatMessages(refresh.Messages[0], refresh.Gist.LatestMessage) > 0
      || refresh.Gist.LatestMessage.MessageID > refresh.Messages.length) {
      // Fetch chat messages from server.
      setLocked(true)
      updateChatState(await frontendService.listChatMessages(refresh.Gist.ChatID))
      setLocked(false)
    } else {
      // console.debug(`Chat deemed fresh: ${JSON.stringify(refresh)}`)
    }
  }, [text])

  // Debounced callback to save draft text (and infer typing status) on server.
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
    await setDraftTextCallback({
      clearText: !draftText || undefined,
      setText: draftText || undefined,
    })
  }, [locked])

  async function cancelDraftsInProgress() {
    await setDraftTextCallback(undefined)
  }

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
    let result: ChatModel
    if (chatID) {
      result = await frontendService.postChatMessage(chatID, text)
    } else {
      const targetUserIDs = props.otherParticipants.map((user) => user.UserID)
      result = await frontendService.postChatMessageToTargetUsers(targetUserIDs, text)
    }
    updateChatState(result)
    setLocked(false)
  }, [text])

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