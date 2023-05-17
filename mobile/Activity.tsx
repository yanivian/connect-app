import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useContext, useState } from 'react'
import { Linking, Platform, ScrollView, View } from 'react-native'
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { Button, Card, Divider, HelperText, IconButton, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ActivityFaq from './ActivityFaq'
import { LoginContext, UserModelContext } from './Contexts'
import GenerativeLanguageService from './GenerativeLanguageService'
import { LoadingAnimation, Section } from './Layouts'
import { ActivityModel, FaqModel, LocationModel } from './Models'
import styles from './Styles'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-us', { weekday: "short", year: 'numeric', month: 'short', day: 'numeric' })
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })
}

async function openGoogleMaps(location: LocationModel) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.Name)}&query_place_id=${location.ID}`
  Linking.openURL(url)
}

// Activity Card

interface ActivityCardProps {
  activity: ActivityModel
  cloneActivity?: (activity: ActivityModel) => void
  deleteActivity?: (activity: ActivityModel) => void
  editActivity?: (activity: ActivityModel) => void
}

export const ActivityCard = (props: ActivityCardProps): JSX.Element => {
  const theme = useTheme()
  const startDate = new Date(props.activity.StartTimestampMillis)
  return (
    <Card style={{ marginBottom: 12 }}>
      <Card.Title title={`${formatDate(startDate)} at ${formatTime(startDate)}`} />
      <Card.Content>
        <Text variant="titleMedium">{props.activity.Name}</Text>
        {props.activity.Location &&
          <Text variant="bodySmall">{props.activity.Location.Name}</Text>
        }
      </Card.Content>
      <Card.Actions>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {props.activity.Location &&
            <IconButton
              icon="directions"
              mode="contained"
              onPress={async () => props.activity.Location && openGoogleMaps(props.activity.Location)}
              style={{
                backgroundColor: theme.colors.primaryContainer,
              }} />
          }
          {props.editActivity &&
            <IconButton
              icon="pencil"
              mode="contained"
              onPress={() => props.editActivity && props.editActivity(props.activity)} />
          }
          {props.cloneActivity &&
            <IconButton
              icon="content-copy"
              mode="contained"
              onPress={() => props.cloneActivity && props.cloneActivity(props.activity)} />
          }
          {props.deleteActivity &&
            <IconButton
              icon="delete"
              mode="contained"
              onPress={() => props.deleteActivity && props.deleteActivity(props.activity)} />
          }
        </ScrollView>
      </Card.Actions>
    </Card>
  )
}

// Activity (Component)

export interface ActivityProps {
  // The activity being edited, if any.
  activity?: ActivityModel
  // If an activity is provided, indicates whether saving should clone the activity or overwrite/edit it.
  clone?: boolean
}

const Activity = (props: ActivityProps & {
  // Callback to save an activity.
  save: (activity: ActivityModel) => void
  // Callback to close this activity component if it is the current route.
  close: () => void
}): JSX.Element => {
  const user = useContext(UserModelContext)!
  const loginContext = useContext(LoginContext)!
  const theme = useTheme()

  const namePlaceholder = 'Play Date'
  const [name, setName] = useState<string | null>(props.activity?.Name || null)
  const [location, setLocation] = useState<LocationModel | undefined>(props.activity?.Location)

  const [faq, setFaq] = useState<FaqModel | undefined>(props.activity?.Faq)
  const [generatingFaq, setGeneratingFaq] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>()

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

  async function generateFaq() {
    setGeneratingFaq(true)
    GenerativeLanguageService.get(loginContext.Credentials.GoogleCloudApiKey)
      .generateActivityFaq({ name: name || namePlaceholder })
      .then(setFaq)
      .catch(setError)
      .finally(() => setGeneratingFaq(false))
  }

  return (
    <Section title={`${title} activity`} close={{ icon: 'close', callback: props.close }}>
      <View>
        {/* Name of the activity. */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={{ alignSelf: 'center', marginRight: 6 }}>
            <MaterialIcons name={'event'} size={32} color={theme.colors.primary} />
          </View>
          <View style={{ flexGrow: 1 }}>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: theme.colors.backdrop,
              }]}
              mode='flat'
              placeholder='Play Date'
              value={name || ''}
              onChangeText={setName}
              autoCapitalize='words'
              autoComplete='off'
              inputMode='text'
              disabled={saving} />
          </View>
        </View>

        <Divider style={{ marginVertical: 12 }} />

        {/* Start and end date and times. */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignSelf: 'flex-start', marginTop: 3, marginRight: 6 }}>
            <MaterialIcons name={'access-time'} size={32} color={theme.colors.primary} />
          </View>
          <View style={{ flexDirection: 'column', flexGrow: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ padding: 6 }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple
                    onPress={() => showDatePicker('start', 'date')}
                    disabled={saving}>
                    <Text variant="bodyLarge">{formatDate(startDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={startDate}
                    onChange={onStartDateChange}
                    mode={'date'}
                    disabled={saving} />
                }
              </View>
              <View style={{ padding: 6, marginLeft: 'auto' }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple
                    onPress={() => showDatePicker('start', 'time')}
                    disabled={saving}>
                    <Text variant="bodyLarge">{formatTime(startDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={startDate}
                    onChange={onStartDateChange}
                    mode={'time'}
                    disabled={saving} />
                }
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ padding: 6 }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple
                    onPress={() => showDatePicker('end', 'date')}
                    disabled={saving}>
                    <Text variant="bodyLarge">{formatDate(endDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={endDate}
                    onChange={onEndDateChange}
                    mode={'date'}
                    disabled={saving} />
                }
              </View>
              <View style={{ padding: 6, marginLeft: 'auto' }}>
                {Platform.OS === 'android' &&
                  <TouchableRipple
                    onPress={() => showDatePicker('end', 'time')}
                    disabled={saving}>
                    <Text variant="bodyLarge">{formatTime(endDate)}</Text>
                  </TouchableRipple>
                }
                {Platform.OS == 'ios' &&
                  <DateTimePicker
                    value={endDate}
                    onChange={onEndDateChange}
                    mode={'time'}
                    disabled={saving} />
                }
              </View>
            </View>
          </View>
        </View>

        <Divider style={{ marginTop: 12, marginBottom: 24 }} />

        {/* Location added. */}
        {location &&
          <View style={{ flexDirection: 'row' }}>
            <View style={{ alignSelf: 'flex-start', marginTop: 3, marginRight: 6 }}>
              <MaterialIcons name={'location-pin'} size={32} color={theme.colors.primary} />
            </View>
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
                  onPress={() => setLocation(undefined)} />
              </View>
            </View>
          </View>
        }

        {/* Location not added. */}
        {!location &&
          <View style={{ flexDirection: 'row' }}>
            <View style={{ alignSelf: 'flex-start', marginTop: 9, marginRight: 6 }}>
              <MaterialIcons name={'location-pin'} size={32} color={theme.colors.primary} />
            </View>
            <View style={{ flexGrow: 1 }}>
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
          </View>
        }

        {/* FAQ */}
        {faq &&
          <View>
            <Divider style={{ marginVertical: 24 }} />
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ alignSelf: 'flex-start', marginTop: 15, marginRight: 6 }}>
                <MaterialIcons name={'info'} size={32} color={theme.colors.primary} />
              </View>
              <View style={{ flexGrow: 1 }}>
                <ActivityFaq
                  faq={faq}
                  setFaq={setFaq} />
              </View>
            </View>
          </View>
        }

        <HelperText
          type="error"
          visible={!!error}>
          {JSON.stringify(error)}
        </HelperText>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {!faq && <Button
            icon={"sign-caution"}
            mode="outlined"
            style={[styles.button, { flex: 1, marginRight: 6 }]}
            labelStyle={styles.buttonLabel}
            onPress={generateFaq}
            disabled={generatingFaq || saving}>
            FAQ
          </Button>
          }
          <Button
            mode="contained"
            style={[styles.button, { flex: 1 }]}
            labelStyle={styles.buttonLabel}
            onPress={() => {
              setSaving(true)
              // TODO: Persist activity.
              const nowMillis = Date.now()
              props.save({
                ID: !props.clone && props.activity?.ID || `item-${nowMillis}`,
                CreatedTimestampMillis: props.activity?.CreatedTimestampMillis || nowMillis,
                Name: name || namePlaceholder,
                Location: location,
                Faq: faq,
                StartTimestampMillis: startDate.getTime(),
                EndTimestampMillis: endDate.getTime(),
                LastUpdatedTimestampMillis: props.activity ? nowMillis : null,
              })
              props.close()
              setSaving(false)
            }}
            disabled={generatingFaq || saving}>
            Save
          </Button>
        </View>
        {(generatingFaq || saving) && <LoadingAnimation />}
      </View>
    </Section>
  )
}

export default Activity