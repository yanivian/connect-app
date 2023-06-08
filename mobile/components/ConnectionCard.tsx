import { parsePhoneNumber } from 'libphonenumber-js'
import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper'
import { UserInfo } from '../Models'
import AvatarCard from './AvatarCard'

interface ConnectionCardProps {
  user: UserInfo
  actionCallback?: (() => void)
  actionLabel?: string
  actionStarted?: boolean
  actionCompleted?: boolean
}

export default function ConnectionCard(props: ConnectionCardProps): JSX.Element {
  const theme = useTheme()
  return (
    <View style={{
      alignItems: 'center',
      borderRadius: theme.roundness,
      flexDirection: 'row',
      marginVertical: 6,
    }}>
      <AvatarCard imageURL={props.user.Image?.URL} />
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
          marginHorizontal: 9,
        }}>
        <Text numberOfLines={1} variant="bodyLarge">
          {props.user.Name || 'Anonymous'}
        </Text>
        {props.user.PhoneNumber &&
          <Text numberOfLines={1} variant="bodySmall">
            {parsePhoneNumber(props.user.PhoneNumber, 'US').formatNational()}
          </Text>
        }
      </View>
      {props.actionCallback &&
        <View style={{ width: 40 }}>
          {(!props.actionStarted || props.actionCompleted) &&
            <IconButton
              aria-label={props.actionLabel}
              disabled={props.actionCompleted}
              icon={props.actionCompleted ? 'check' : 'plus'}
              mode={props.actionCompleted ? undefined : 'contained'}
              onPress={props.actionCallback}
              size={20}
              style={{ margin: 0 }}
            />
          }
          {props.actionStarted && !props.actionCompleted &&
            <ActivityIndicator animating={true} size='small' />
          }
        </View>
      }
    </View>
  )
}