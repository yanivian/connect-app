import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { InviteModel } from '../Models'

export type InviteState = 'ACTIVE' | 'DELETING'

interface InviteCardProps {
  invite: InviteModel
}

export function InviteCard(props: InviteCardProps): JSX.Element {
  const theme = useTheme()

  return (
    <View style={{
      borderRadius: theme.roundness,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 6,
    }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          flexGrow: 1,
        }}>
        <Text numberOfLines={1} variant="bodyLarge">
          {props.invite.Name}
        </Text>
        <Text numberOfLines={1} variant="bodyMedium">
          {props.invite.PhoneNumber}
        </Text>
      </View>
    </View>
  )
}