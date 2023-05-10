import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useContext, useState } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { Button, Divider, HelperText, IconButton, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { LoginContext, UserModelContext } from './Contexts'
import { LoadingAnimation, Section } from './Layouts'
import { ActivityModel, LocationModel } from './Models'
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

const Activity = (props: ActivityProps): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!

  const [name, setName] = useState<string | null>(props.activity?.Name || null)
  const [location, setLocation] = useState<LocationModel | null>(props.activity?.Location || null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>()

  const theme = useTheme()
  const title = !!props.activity ? (props.clone ? 'Clone' : 'Edit') : 'New'

  const initialStartDateMillis = Math.trunc(Date.now() / 1_800_000) * 1_800_000 + 1_800_000
  const initialEndDateMillis = initialStartDateMillis + 3_600_000

  const [startDate, setStartDate] = useState(new Date(props.activity?.StartTimestampMillis || initialStartDateMillis))
  const [endDate, setEndDate] = useState(new Date(props.activity?.EndTimestampMillis || initialEndDateMillis))

  function onStartDateChange(unused: DateTimePickerEvent, selectedValue: Date | undefined) {
    if (selectedValue) {
      const deltaMillis = selectedValue.getTime() - startDate.getTime()
      setStartDate(selectedValue)
      setEndDate(new Date(endDate.getTime() + deltaMillis))
    }
  }

  function onEndDateChange(unused: DateTimePickerEvent, selectedValue: Date | undefined) {
    if (selectedValue) {
      setEndDate(selectedValue)
    }
  }

  function showDatePicker(which: 'start' | 'end', mode: 'date' | 'time') {
    DateTimePickerAndroid.open({
      value: which === 'start' ? startDate : endDate,
      onChange: which === 'start' ? onStartDateChange : onEndDateChange,
      mode,
      is24Hour: false,
    })
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-us', { weekday: "short", year: 'numeric', month: 'short', day: 'numeric' })
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <Section title={`${title} activity`} close={{ icon: 'close', callback: props.close }}>
      <View>
        <TextInput
          style={[styles.textInput, {
            marginBottom: 12,
          }]}
          mode='outlined'
          label='Name'
          value={name || ''}
          onChangeText={setName}
          autoCapitalize='words'
          autoComplete='off'
          inputMode='text'
          disabled={saving} />
        <Divider style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignSelf: 'flex-start' }}>
            <MaterialIcons name={'location-pin'} size={32} color={theme.colors.primary} />
          </View>
          {location &&
            <View style={{ flexDirection: 'row', flexGrow: 1, marginLeft: 'auto' }}>
              <View style={{ flexDirection: 'column', flexGrow: 1 }}>
                <Text variant="bodyLarge">
                  {location.Name}
                </Text>
                <Text variant="bodySmall">
                  {location.Address}
                </Text>
              </View>
              <View style={{ alignSelf: 'flex-start', marginLeft: 'auto', marginRight: 0 }}>
                <IconButton
                  style={{ margin: 0 }}
                  disabled={saving}
                  size={20}
                  icon='close'
                  onPress={() => setLocation(null)} />
              </View>
            </View>
          }
          {!location &&
            <View style={{ flexDirection: 'column', flexGrow: 1, marginRight: 32 }}>
              <Text style={[styles.text, { marginBottom: 12 }]} variant="bodyLarge">
                Adding a location will help participants to plan better for it.
              </Text>
              <ScrollView horizontal contentContainerStyle={{ flex: 1, width: '100%' }}>
                <GooglePlacesAutocomplete
                  renderDescription={(row) => row.description}
                  suppressDefaultStyles={true}
                  keepResultsAfterBlur={true}
                  debounce={200}
                  placeholder='Add location'
                  query={{
                    key: loginContext.Credentials.GoogleCloudApiKey,
                    language: 'en',
                  }}
                  styles={{
                    container: {
                      width: '100%',
                    },
                    row: {
                      paddingVertical: 6,
                      alignContent: 'center',
                      justifyContent: 'center',
                      elevation: 2,
                    },
                    listView: [styles.text, {
                      paddingHorizontal: 12,
                      borderRadius: theme.roundness,
                      borderWidth: 1,
                      borderColor: theme.colors.primary,
                    }],
                    textInputContainer: {
                      paddingHorizontal: 12,
                      borderRadius: theme.roundness,
                      borderWidth: 1,
                      borderColor: theme.colors.inverseSurface,
                      backgroundColor: theme.colors.background,
                    },
                    textInput: styles.textInput,
                  }}
                  enablePoweredByContainer={false}
                  fetchDetails={true}
                  onPress={(data: GooglePlaceData, detail: GooglePlaceDetail | null) => {
                    setLocation({
                      ID: data.place_id,
                      Name: detail!.name,
                      Address: detail!.formatted_address,
                      Latitude: detail!.geometry!.location!.lat,
                      Longitude: detail!.geometry!.location!.lng,
                    })
                  }}
                  onFail={setError} />
              </ScrollView>
            </View>
          }
        </View>
        <Divider style={{ marginVertical: 12 }} />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignSelf: 'flex-start' }}>
            <MaterialIcons name={'access-time'} size={32} color={theme.colors.primary} />
          </View>
          <View style={{ flexDirection: 'column', flexGrow: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ padding: 6 }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple onPress={() => showDatePicker('start', 'date')}>
                    <Text variant="bodyLarge">{formatDate(startDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={startDate}
                    onChange={onStartDateChange}
                    mode={'date'} />
                }
              </View>
              <View style={{ padding: 6, marginLeft: 'auto' }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple onPress={() => showDatePicker('start', 'time')}>
                    <Text variant="bodyLarge">{formatTime(startDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={startDate}
                    onChange={onStartDateChange}
                    mode={'time'} />
                }
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ padding: 6 }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple onPress={() => showDatePicker('end', 'date')}>
                    <Text variant="bodyLarge">{formatDate(endDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={endDate}
                    onChange={onEndDateChange}
                    mode={'date'} />
                }
              </View>
              <View style={{ padding: 6, marginLeft: 'auto' }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple onPress={() => showDatePicker('end', 'time')}>
                    <Text variant="bodyLarge">{formatTime(endDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={endDate}
                    onChange={onEndDateChange}
                    mode={'time'} />
                }
              </View>
            </View>
          </View>
        </View>
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