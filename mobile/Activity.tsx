import React, { useContext, useState } from 'react'
import { Image, View } from 'react-native'
import { DescriptionRow, GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { Button, HelperText, IconButton, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { LoginContext, UserModelContext } from './Contexts'
import { LoadingAnimation, Section } from './Layouts'
import { ActivityModel } from './Models'
import styles from './Styles'

interface ActivityProps {
  // The activity being edited, if any.
  activity?: ActivityModel | undefined
  // If an activity is provided, indicates whether changes should be saved as a new activity.
  clone?: boolean | undefined
  // Callback when saving an activity.
  setActivity: (activity: ActivityModel) => void
  // Callback to close the component.
  close: () => void
}

interface Place {
  data: GooglePlaceData
  detail: GooglePlaceDetail | null
}

type PlaceTypeMap = {
  [placeType: string]: {
    queryType: string,
    renderAutocomplete: (row: DescriptionRow) => string
    renderName: (p: Place) => string
    renderDescription: (p: Place) => string
    appIcon: string
    usePlaceIcon: boolean
  }
}

const placeTypeMap: PlaceTypeMap = {
  'ESTABLISHMENT': {
    queryType: 'establishment',
    renderAutocomplete: (row) => row.description,
    renderName: (p) => p.data.structured_formatting.main_text,
    renderDescription: (p) => p.data.structured_formatting.secondary_text,
    appIcon: 'location-pin',
    usePlaceIcon: true,
  },
  'CITY': {
    queryType: '(cities)',
    renderAutocomplete: (row) => row.description,
    renderName: (p) => `City of ${p.data.structured_formatting.main_text}`,
    renderDescription: (p) => p.data.structured_formatting.secondary_text,
    appIcon: 'location-city',
    usePlaceIcon: false,
  },
  'ADDRESS': {
    queryType: 'address',
    renderAutocomplete: (row) => row.description,
    renderName: (p) => p.data.structured_formatting.main_text,
    renderDescription: (p) => p.data.structured_formatting.secondary_text,
    appIcon: 'edit-location',
    usePlaceIcon: false,
  }
}

const Activity = (props: ActivityProps): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!

  const [name, setName] = useState<string | null>(props.activity?.Name || null)
  const [placeType, setPlaceType] = useState<string>('ESTABLISHMENT')
  const [place, setPlace] = useState<Place | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>()

  const theme = useTheme()
  const title = !!props.activity ? (props.clone ? 'Clone' : 'Edit') : 'New'

  return (
    <Section title={`${title} activity`} close={{ icon: 'close', callback: props.close }}>
      <View>
        <TextInput
          style={[styles.textInput, {
            marginBottom: 24,
          }]}
          mode='outlined'
          label='Name'
          value={name || ''}
          onChangeText={setName}
          autoCapitalize='words'
          autoComplete='off'
          inputMode='text'
          disabled={saving} />
        {place &&
          <View style={{ flexDirection: 'row' }}>
            <View>
              {place.detail?.icon && placeTypeMap[placeType]!.usePlaceIcon &&
                <Image style={{ width: 60, height: 60 }} source={{ uri: place.detail.icon }} />
              }
              {(!place.detail?.icon || !placeTypeMap[placeType]!.usePlaceIcon) &&
                <MaterialIcons name={placeTypeMap[placeType]!.appIcon} size={60} color={theme.colors.primary} />
              }
            </View>
            <View style={{ flexDirection: 'column', flexGrow: 1, paddingHorizontal: 12 }}>
              <Text style={[styles.text]} variant="bodyLarge">
                {placeTypeMap[placeType]!.renderName(place)}
              </Text>
              <Text style={[styles.text, {}]} variant="bodySmall">
                {placeTypeMap[placeType]!.renderDescription(place)}
              </Text>
            </View>
            <IconButton
              disabled={saving}
              icon='close'
              onPress={() => setPlace(null)} />
          </View>
        }
        {!place &&
          <View>
            <Text style={[styles.text, { marginBottom: 12 }]} variant="bodyLarge">
              Adding a place will allow help participants to better plan for it.
            </Text>
            <SegmentedButtons
              style={{ marginBottom: 12 }}
              value={placeType}
              onValueChange={(value) => {
                setPlaceType(value)
              }}
              buttons={[
                { label: 'Establishment', value: 'ESTABLISHMENT', disabled: saving, style: { flex: 2, } },
                { label: 'City', value: 'CITY', disabled: saving, style: { flex: .5, } },
                { label: 'Address', value: 'ADDRESS', disabled: saving, style: { flex: 1, } },
              ]} />
            <GooglePlacesAutocomplete
              renderDescription={placeTypeMap[placeType]!.renderAutocomplete}
              suppressDefaultStyles={true}
              keepResultsAfterBlur={false}
              minLength={3}
              debounce={200}
              placeholder='...'
              query={{
                key: loginContext.Credentials.GoogleCloudApiKey,
                language: 'en',
                type: placeTypeMap[placeType]!.queryType,
              }}
              styles={{
                row: { paddingVertical: 6, alignContent: 'center', justifyContent: 'center', elevation: 2 },
                listView: [styles.text, {
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: theme.colors.primary,
                }],
                textInputContainer: {
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: theme.colors.inverseSurface,
                },
                textInput: styles.textInput,
              }}
              enablePoweredByContainer={false}
              fetchDetails={true}
              onPress={(data, detail = null) => setPlace({ data, detail })}
              onFail={setError} />
          </View>
        }
        <HelperText
          type="error"
          visible={!!error}>
          {error}
        </HelperText>
        <Button
          mode="contained"
          style={[styles.button, { marginBottom: 12 }]}
          labelStyle={styles.buttonLabel}
          onPress={() => setSaving(true)}
          disabled={saving}>
          Save
        </Button>
        {saving && <LoadingAnimation />}
      </View>
    </Section>
  )
}

export default Activity