import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, Card, Chip, Searchbar, Text, useTheme } from 'react-native-paper'
import { compareInvites } from './Compare'
import { Page, Section } from './Layouts'
import { ContactModel, InviteModel } from './Models'
import { delayedPromise, useMutatingState } from './React'

type ContactState = 'OPEN' | 'INVITING' | 'INVITED' | 'FRIEND'

interface ContactCardProps {
  contact: ContactModel
  state: ContactState
  inviteCallback: () => void
}

function ContactCard(props: ContactCardProps): JSX.Element {
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
          {props.contact.Name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              textAlign: 'center',
              paddingHorizontal: 6,
              marginRight: 6,
              backgroundColor: theme.colors.onTertiary,
            }}
            variant="bodyMedium"
          >
            {props.contact.Label}
          </Text>
          <Text numberOfLines={1} variant="bodyMedium">
            {props.contact.PhoneNumber.formatNational()}
          </Text>
        </View>
      </View>
      <View style={[localStyles.inviteContainer, { alignSelf: 'center', paddingLeft: 6 }]}>
        {props.state === 'OPEN' &&
          <Button
            mode='contained-tonal'
            onPress={props.inviteCallback}
          >
            Invite
          </Button>
        }
        {props.state === 'INVITING' &&
          <ActivityIndicator animating={true} size='small' />
        }
        {props.state === 'INVITED' &&
          <Text variant='bodyMedium' style={localStyles.statusText}>
            Invited
          </Text>
        }
        {props.state === 'FRIEND' &&
          <Text variant='bodyMedium' style={localStyles.statusText}>
            Connected
          </Text>
        }
      </View>
    </View>
  )
}

async function createInvite(contact: ContactModel): Promise<InviteModel> {
  // TODO: Persist invite via frontend.
  const phoneNumber = contact.PhoneNumber.number
  return delayedPromise(3000, {
    ID: phoneNumber,
    Name: contact.Name,
    PhoneNumber: phoneNumber,
    CreatedTimestampMillis: Date.now(),
  })
}

export interface MyContactsProps {
  contacts: Array<ContactModel>
  invited: Array<InviteModel>
  inviteCallback: (invites: Array<InviteModel>) => void
}

export function MyContacts(props: MyContactsProps & {
  close: () => void
}): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')

  function testSearchQuery(contact: ContactModel): boolean {
    if (!searchQuery) {
      return true
    }
    const query = searchQuery.toLowerCase()
    return [contact.Name, contact.PhoneNumber.number]
      .filter((text) => text.toLowerCase().indexOf(query) >= 0)
      .length > 0
  }

  const [labels] = useState<Array<string>>(Array.from(new Set(props.contacts.map((contact) => contact.Label))).sort())
  const [activeLabels, setActiveLabels] = React.useState(labels)

  function isLabelActive(label: string) {
    return activeLabels.filter((activeLabel) => activeLabel === label).length > 0
  }

  function toggleLabel(label: string) {
    if (isLabelActive(label)) {
      setActiveLabels(activeLabels.filter((activeLabel) => activeLabel !== label))
    } else {
      setActiveLabels([...activeLabels, label])
    }
  }

  const [inviting, invitingRef, setInviting] = useMutatingState<Array<string>>([])
  const [invited, invitedRef, setInvited] = useMutatingState(props.invited)

  function determineContactState(contact: ContactModel): ContactState {
    const phoneNumber = contact.PhoneNumber.number
    if (inviting.includes(phoneNumber)) {
      return 'INVITING'
    }
    if (invited.map((i) => i.PhoneNumber).includes(phoneNumber)) {
      return 'INVITED'
    }
    return 'OPEN'
  }

  async function inviteNow(contact: ContactModel) {
    const phoneNumber = contact.PhoneNumber.number
    setInviting([...invitingRef.current, phoneNumber])
    return createInvite(contact)
      .then((invite) => {
        setInviting(invitingRef.current.filter((inviting) => inviting !== phoneNumber))
        setInvited(invitedRef.current = [...invitedRef.current, invite].sort(compareInvites))
        props.inviteCallback([invite])
        return invite
      })
  }

  return (
    <Page>
      <Section
        title='Contacts'
        actions={[{
          label: 'Close',
          icon: 'close',
          callback: props.close,
        }]}
      >
        <View style={{ flex: 1, flexGrow: 1, flexDirection: 'column', marginBottom: 50 }}>
          <Searchbar
            placeholder='Search'
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          <View style={{ height: 12 }}></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
            {labels.map((label) => {
              return (
                <Chip
                  key={label}
                  mode='flat'
                  onPress={() => toggleLabel(label)}
                  selected={isLabelActive(label)}
                >
                  {label}
                </Chip>
              )
            })}
          </View>
          <View style={{ height: 12 }}></View>
          <Card
            mode='contained'
            style={{
              flex: 1,
              flexGrow: 1,
              backgroundColor: 'transparent',
            }}
          >
            <Card.Content>
              <ScrollView>
                {
                  props.contacts
                    .filter((contact) => isLabelActive(contact.Label))
                    .filter(testSearchQuery)
                    .map((contact) => {
                      return (
                        <ContactCard
                          key={contact.PhoneNumber.number}
                          contact={contact}
                          state={determineContactState(contact)}
                          inviteCallback={async () => inviteNow(contact)}
                        />
                      )
                    })
                }
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
      </Section>
    </Page>
  )
}

const localStyles = StyleSheet.create({
  inviteContainer: {
    height: 40,
    width: 90,
    alignContent: 'center',
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'center',
  },
})