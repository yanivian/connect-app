import React, { useContext, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Card, Portal, Snackbar, TextInput, useTheme } from 'react-native-paper'
import { FrontendServiceContext, UserApiContext } from "../Contexts"
import { Page, Section } from '../Layouts'
import { ChatModel, UserInfo } from '../Models'
import styles from '../Styles'
import { useAppDispatch, useAppSelector } from '../redux/Hooks'
import { incorporateChat } from '../redux/MyChatsSlice'
import { summarizeParticipants } from '../utils/ChatUtils'

export interface ChatPageProps {
  chatID?: string
  otherParticipants: Array<UserInfo>
}

function findChatByID(chatID: string, list: Array<ChatModel>): ChatModel | undefined {
  const matches = list.filter((c) => c.Gist.ChatID === chatID)
  return matches && matches[0]
}

export function ChatPage(props: ChatPageProps & {
  close: () => void
}): JSX.Element {
  const [error, setError] = useState<string | null>()

  const state = useAppSelector((state) => state.MyChatsSlice)
  const dispatch = useAppDispatch()

  const userApi = useContext(UserApiContext)!
  const otherParticipantUserIDs = props.otherParticipants && props.otherParticipants.map((u) => u.UserID)

  const frontendService = useContext(FrontendServiceContext)!

  const [chatID, setChatID] = useState(props.chatID)
  const chat = chatID && state.Chats && findChatByID(chatID, state.Chats) || undefined

  const [refreshing, setRefreshing] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  // Fetch chat messages from server if needed.
  // TODO: When real-time mode is disabled, always fetch messages from server.
  useEffect(() => {
    (async () => {
      if (!chatID) {
        return
      }
      if (!!chat && chat.Gist.LatestMessage.MessageID === chat.Gist.LastSeenMessageID) {
        return
      }
      setRefreshing(true)
      dispatch(incorporateChat(await frontendService.listChatMessages(chatID)))
    })()
    setRefreshing(false)
  }, [])

  async function postChatMessage() {
    // TODO: Handle the case of more than one target user.
    const targetUserID = otherParticipantUserIDs && otherParticipantUserIDs[0] || userApi.uid
    setSending(true)
    const chat = await frontendService.postChatMessage(targetUserID, text || undefined)
    if (!chatID) {
      setChatID(chat.Gist.ChatID)
    }
    dispatch(incorporateChat(chat))
    setText('')
    setSending(false)
  }

  const theme = useTheme()
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
          marginBottom: 70,
        }}>
          <Card
            mode='outlined'
            style={{
              flex: 1,
              flexGrow: 1,
              backgroundColor: 'transparent',
            }}
          >
            <Card.Content>
            </Card.Content>
          </Card>
          <TextInput
            outlineStyle={{ borderRadius: 50 }}
            style={styles.textInput}
            mode="outlined"
            value={text}
            onChangeText={setText}
            onSubmitEditing={async (e) => postChatMessage()}
            placeholder='Message'
            inputMode="text"
            disabled={sending}
            error={!!error}
          />
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