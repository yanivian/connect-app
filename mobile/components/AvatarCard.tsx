import React, { CSSProperties } from 'react'
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'
import { useTheme } from 'react-native-paper'
import ProfilePlaceholder from '../images/ProfilePlaceholder.svg'

interface AvatarProps {
  imageURL?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

const defaultSize = 50
const imageSizeIncrements = 50

export default function AvatarCard(props: AvatarProps): JSX.Element {
  const theme = useTheme()
  const renderSize = props.size || defaultSize
  const imageSize = imageSizeIncrements * Math.ceil(renderSize / imageSizeIncrements)
  const imageStyle: StyleProp<ImageStyle> & CSSProperties = {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
    borderRadius: theme.roundness,
    borderWidth: 1,
    overflow: 'hidden',
    height: renderSize,
    width: renderSize,
  }
  return (
    <View style={props.style}>
      {props.imageURL &&
        <Image style={imageStyle} source={{ uri: `${props.imageURL}=s${imageSize}-c` }} />
      }
      {!props.imageURL &&
        <ProfilePlaceholder style={imageStyle} />
      }
    </View>
  )
}