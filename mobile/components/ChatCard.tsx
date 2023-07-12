import React, { useContext } from 'react'
import { View } from 'react-native'
import { Badge, Text, useTheme } from 'react-native-paper'
import { UserApiContext } from '../Contexts'
import { ChatMessageModel, ChatModel, UserInfo } from '../Models'
import AvatarCard from './AvatarCard'

interface ChatCardProps {
  chat: ChatModel
}

function summarizeParticipants(participants: Array<UserInfo>): string {
  const names = participants.map((p) => p.Name || p.PhoneNumber || 'Anonymous')
  switch (names.length) {
    case 1:
      return names[0]
    case 2:
      return `${names[0]} and ${names[1]}`
    case 3:
      return `${names[0]}, ${names[1]} and ${names[2]}`
    default:
      return `${names[0]} and ${names.length - 1} others`
  }
}

function summarizePoster(message: ChatMessageModel, userID: string, numOtherParticipants: number) {
  if (userID === message.Poster.UserID) {
    return 'You'
  }
  if (numOtherParticipants === 1) {
    return 'They'
  }
  return message.Poster.Name || message.Poster.PhoneNumber || 'Anonymous'
}

function pickParticipantForAvatarCard(otherParticipants: Array<UserInfo>, participants: Array<UserInfo>): UserInfo {
  const otherParticipantsWithAvatars = otherParticipants.filter((p) => !!p.Image)
  if (otherParticipantsWithAvatars) {
    return otherParticipantsWithAvatars[0]
  }
  if (otherParticipants) {
    return otherParticipants[0]
  }
  return participants[0]!
}

export default function ChatCard(props: ChatCardProps): JSX.Element {
  const theme = useTheme()
  const userApi = useContext(UserApiContext)!
  const otherParticipants = props.chat.Gist.Participants.filter((user) => user.UserID !== userApi.uid)
  const avatarParticipant = pickParticipantForAvatarCard(otherParticipants, props.chat.Gist.Participants)
  const message = props.chat.Messages[0]!
  const badgeCount = props.chat.Gist.LatestMessage.MessageID - (props.chat.Gist.LastSeenMessageID || 0)

  return (
    <View style={{
      alignItems: 'center',
      borderRadius: theme.roundness,
      flexDirection: 'row',
      marginVertical: 6,
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
  )
}