import React, { useContext } from 'react'
import { View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { UserApiContext } from '../Contexts'
import { ChatMessageModel } from '../Models'
import { summarizePoster } from '../utils/ChatMessageUtils'
import AvatarCard from './AvatarCard'

interface ChatMessageCardProps {
  message: ChatMessageModel
  numOtherParticipants: number
}

export default function ChatMessageCard(props: ChatMessageCardProps): JSX.Element {
  const theme = useTheme()
  const userApi = useContext(UserApiContext)!

  const isMyMessage = props.message.Poster.UserID === userApi.uid
  const textAlign = isMyMessage ? 'right' : 'left'

  return (
    <View style={{
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      borderRadius: theme.roundness,
      flexDirection: 'row',
      width: '80%',
    }}>
      {!isMyMessage &&
        <AvatarCard
          imageURL={props.message.Poster.Image?.URL}
          style={{ marginRight: 9 }}
        />
      }
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
        }}>
        {props.numOtherParticipants > 1 &&
          <Text numberOfLines={1} style={{ flex: 1, fontStyle: 'italic', textAlign, color: theme.colors.primary }} variant="bodyMedium">
            {summarizePoster(props.message, userApi.uid, props.numOtherParticipants)}
          </Text>
        }
        <Text style={{ flex: 1, flexGrow: 1, textAlign, verticalAlign: 'middle' }} variant="bodyLarge">
          {props.message.Text || '(Nothing)'}
        </Text>
      </View>
      {isMyMessage &&
        <AvatarCard
          imageURL={props.message.Poster.Image?.URL}
          style={{ marginLeft: 9 }}
        />
      }
    </View>
  )
}