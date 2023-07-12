import React, { useContext } from 'react'
import { View } from 'react-native'
import { Badge, Text, TouchableRipple, useTheme } from 'react-native-paper'
import { UserApiContext } from '../Contexts'
import { ChatModel } from '../Models'
import { summarizePoster } from '../utils/ChatMessageUtils'
import { pickParticipantForAvatarCard, summarizeParticipants } from '../utils/ChatUtils'
import AvatarCard from './AvatarCard'

interface ChatCardProps {
  chat: ChatModel
  selectCallback: () => void
}

export default function ChatCard(props: ChatCardProps): JSX.Element {
  const theme = useTheme()
  const userApi = useContext(UserApiContext)!
  const otherParticipants = props.chat.Gist.Participants.filter((user) => user.UserID !== userApi.uid)
  const avatarParticipant = pickParticipantForAvatarCard(otherParticipants, props.chat.Gist.Participants)
  const message = props.chat.Messages[0]!
  const badgeCount = props.chat.Gist.LatestMessage.MessageID - (props.chat.Gist.LastSeenMessageID || 0)

  function select() {
    props.selectCallback()
  }

  return (
    <TouchableRipple onPress={select}>
      <View style={{
        alignItems: 'center',
        borderRadius: theme.roundness,
        flexDirection: 'row',
      }}>
        <AvatarCard
          imageURL={avatarParticipant.Image?.URL}
          style={{ marginRight: 9 }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            flexGrow: 1,
          }}>
          <Text numberOfLines={1} variant="bodyLarge">
            {summarizeParticipants(otherParticipants)}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexGrow: 1,
            }}>
            <Text numberOfLines={1} style={{ maxWidth: '50%', fontStyle: 'italic' }} variant="bodySmall">
              {summarizePoster(message, userApi.uid, otherParticipants.length)}
            </Text>
            <Text style={{ marginRight: 4, fontStyle: 'italic' }} variant="bodySmall">
              :
            </Text>
            <Text numberOfLines={1} style={{ flex: 1, flexGrow: 1 }} variant="bodySmall">
              {message.Text || '(Nothing)'}
            </Text>
          </View>
        </View>
        <Badge style={{ alignSelf: 'center', marginLeft: 9 }} visible={badgeCount > 0}>{(badgeCount > 10) ? '10+' : badgeCount}</Badge>
      </View>
    </TouchableRipple>
  )
}