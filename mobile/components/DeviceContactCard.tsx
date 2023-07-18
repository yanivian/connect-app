import { parsePhoneNumber } from 'libphonenumber-js'
import React from 'react'
import { View } from 'react-native'
import { Text, TouchableRipple, useTheme } from 'react-native-paper'
import { UserInfo } from '../Models'
import AvatarCard from './AvatarCard'

export interface DeviceContactCardProps {
  user: UserInfo
  isSelected: boolean
}

export default function DeviceContactCard(props: DeviceContactCardProps & {
  toggleSelect: () => void
}): JSX.Element {
  const theme = useTheme()

  return (
    <TouchableRipple onPress={props.toggleSelect}>
      <View style={{
        alignItems: 'center',
        borderRadius: theme.roundness,
        flexDirection: 'row',
        marginVertical: 6,
        backgroundColor: props.isSelected ? theme.colors.primaryContainer : 'transparent',
      }}>
        <AvatarCard
          imageURL={props.user.Image?.URL}
          size={60}
          style={{ marginRight: 9 }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            flexGrow: 1,
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