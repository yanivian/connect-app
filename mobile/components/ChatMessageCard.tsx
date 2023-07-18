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
  const bubbleBorderRadius = 15
  const userApi = useContext(UserApiContext)!

  const isMyMessage = props.message.Poster.UserID === userApi.uid
  const textAlign = isMyMessage ? 'right' : 'left'

  return (
    <View style={{
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      borderRadius: theme.roundness,
      flexDirection: 'row',
      transform: [{ scaleY: -1 }]
    }}>
      {!isMyMessage &&
        <AvatarCard
          imageURL={props.message.Poster.Image?.URL}
          size={32}
          style={{
            alignSelf: 'flex-start',
            marginRight: 5,
          }}
        />
      }
      <View
        style={{
          borderTopLeftRadius: isMyMessage && bubbleBorderRadius || undefined,
          borderTopRightRadius: !isMyMessage && bubbleBorderRadius || undefined,
          borderBottomLeftRadius: bubbleBorderRadius,
          borderBottomRightRadius: bubbleBorderRadius,
          backgroundColor: isMyMessage ? theme.colors.primaryContainer : theme.colors.secondaryContainer,
          paddingHorizontal: 9,
          paddingVertical: 5,
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
        }}>
        {props.numOtherParticipants > 1 &&
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.primary,
              fontStyle: 'italic',
              fontWeight: 'bold',
              textAlign,
            }}
            variant="bodyMedium"
          >
            {summarizePoster(props.message, userApi.uid, props.numOtherParticipants)}
          </Text>
        }
        <Text
          style={{
            flexGrow: 1,
            textAlign,
            verticalAlign: 'middle',
          }}
          variant="bodyLarge"
        >
          {props.message.Text || ''}
        </Text>
      </View>
      {isMyMessage &&
        <AvatarCard
          imageURL={props.message.Poster.Image?.URL}
          size={32}
          style={{
            alignSelf: 'flex-start',
            marginLeft: 5,
          }}
        />
      }
    </View>
  )
}