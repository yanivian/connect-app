import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'
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

const CONTACT_CARD_HEIGHT = 56
const CONTACT_CARD_WINDOW_SIZE = 4

function ContactCard(props: ContactCardProps): JSX.Element {
  const theme = useTheme()

  return (
    <View style={{
      borderRadius: theme.roundness,
      flexDirection: 'row',
      height: CONTACT_CARD_HEIGHT,
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
              backgroundColor: theme.colors.primary,
              color: theme.colors.onPrimary,
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

export interface ContactsPageProps {
  contacts: Array<ContactModel>
  invited: Array<InviteModel>
  inviteCallback: (invite: InviteModel) => void
}

export function ContactsPage(props: ContactsPageProps & {
  close: () => void
}): JSX.Element {
  const labels = useMemo<Array<string>>(() => Array.from(new Set(props.contacts.map((contact) => contact.Label))).sort(), [])

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

  const [activeLabel, setActiveLabel] = React.useState<string | undefined>(undefined)

  function toggleActiveLabel(label: string) {
    setActiveLabel((label === activeLabel) ? undefined : label)
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
        props.inviteCallback(invite)
        return invite
      })
  }

  // Memoization to improve virtualized list performance for contacts.
  // Reference: https://codingislove.com/optimize-react-native-flatlist-performance/
  const contacts = useMemo(() => props.contacts
    .filter((contact) => !activeLabel || contact.Label === activeLabel)
    .filter(testSearchQuery), [activeLabel, searchQuery])
  const contactKeyExtractor = useCallback((contact: ContactModel) => contact.PhoneNumber.number, [])
  const contactRenderer: ListRenderItem<ContactModel> = useCallback(({ item }) => {
    return (
      <ContactCard
        contact={item}
        state={determineContactState(item)}
        inviteCallback={async () => inviteNow(item)}
      />
    )
  }, [invited, inviting])
  const contactItemLayout = useCallback<(data: any, index: number) => {
    length: number,
    offset: number,
    index: number,
  }>((_data, index) => ({
    length: CONTACT_CARD_HEIGHT,
    offset: CONTACT_CARD_HEIGHT * index,
    index,
  }), [])

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
        <View style={{ flex: 1, flexGrow: 1, flexDirection: 'column' }}>
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
                  onPress={() => toggleActiveLabel(label)}
                  selected={label === activeLabel}
                  showSelectedOverlay={true}
                >
                  {label}
                </Chip>
              )
            })}
          </View>
          <View style={{ height: 12 }}></View>
          <Card
            mode='outlined'
            style={{
              flex: 1,
              flexGrow: 1,
              backgroundColor: 'transparent',
            }}
          >
            <Card.Content>
              <FlatList
                data={contacts}
                getItemLayout={contactItemLayout}
                keyExtractor={contactKeyExtractor}
                renderItem={contactRenderer}
                windowSize={CONTACT_CARD_WINDOW_SIZE}
              />
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
    width: 100,
    alignContent: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  statusText: {
    textAlign: 'center',
  },
})