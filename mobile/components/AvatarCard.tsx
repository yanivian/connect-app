import React, { CSSProperties } from 'react'
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'
import { useTheme } from 'react-native-paper'
import ProfilePlaceholder from '../images/ProfilePlaceholder.svg'

interface AvatarProps {
  imageURL: string | undefined
  style?: StyleProp<ViewStyle>
}

export default function AvatarCard(props: AvatarProps): JSX.Element {
  const theme = useTheme()
  const size = 50
  const imageStyle: StyleProp<ImageStyle> & CSSProperties = {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
    borderRadius: theme.roundness,
    borderWidth: 1,
    overflow: 'hidden',
    height: size,
    width: size,
  }
  return (
    <View style={props.style}>
      {props.imageURL &&
        <Image style={imageStyle} source={{ uri: `${props.imageURL}=s${size}-c` }} />
      }
      {!props.imageURL &&
        <ProfilePlaceholder style={imageStyle} />
      }
    </View>
  )
}