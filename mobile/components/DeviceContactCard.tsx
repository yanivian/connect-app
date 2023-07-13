import { parsePhoneNumber } from 'libphonenumber-js'
import React from 'react'
import { View } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { UserInfo } from '../Models'
import AvatarCard from './AvatarCard'

interface DeviceContactCardProps {
  user: UserInfo
  selectCallback: () => void
}

export default function DeviceContactCard(props: DeviceContactCardProps): JSX.Element {
  const theme = useTheme()

  function select() {
    props.selectCallback()
  }

  return (
    <TouchableRipple onPress={select}>
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
      </View>
    </TouchableRipple>
  )
}