import { parsePhoneNumber } from 'libphonenumber-js'
import React, { useState } from 'react'
import { View } from 'react-native'
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper'
import { UserInfo } from '../Models'
import AvatarCard from './AvatarCard'

interface ConnectionCardProps {
  user: UserInfo
  actions?: Array<{ icon: string, label: string, completed: boolean, callback: () => Promise<any> }>
}

export default function ConnectionCard(props: ConnectionCardProps): JSX.Element {
  const theme = useTheme()
  const [running, setRunning] = useState(false)
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
      {props.actions &&
        <View>
          {props.actions.map((action) => {
            return (
              <View key={action.label}>
                {!running &&
                  <IconButton
                    aria-label={action.label}
                    disabled={action.completed}
                    icon={action.icon}
                    mode={action.completed ? undefined : 'contained'}
                    onPress={async () => {
                      setRunning(true)
                      await action.callback()
                    }}
                    size={20}
                    style={{ margin: 0, marginLeft: 6 }}
                  />
                }
                {running && !action.completed &&
                  <ActivityIndicator animating={true} size='small' />
                }
              </View>
            )
          })}
        </View>
      }
    </View>
  )
}