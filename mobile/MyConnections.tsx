import parsePhoneNumber, { NumberType } from 'libphonenumber-js'
import React, { useContext, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import Contacts from 'react-native-contacts'
import { Card, FAB, Modal, Portal, Snackbar, Text } from 'react-native-paper'
import { compareContacts } from './Compare'
import { ContactsPage } from './Contacts'
import { FrontendServiceContext, UserApiContext } from './Contexts'
import { ContactModel, UserInfo } from './Models'
import styles from './Styles'
import ConnectionCard from './components/ConnectionCard'
import { InviteCard } from './components/InviteCard'
import { useAppDispatch, useAppSelector } from './redux/Hooks'
import { addInvite, addOutgoingConnection } from './redux/MyConnectionsSlice'
import { ERROR_CONTACTS_PERMISSION_NOT_GRANTED, fetchContacts } from './utils/ContactsUtils'
import { isUserIn } from './utils/UserUtils'

const ALLOWED_PHONE_NUMBER_TYPES = new Set<NumberType>(['FIXED_LINE_OR_MOBILE', 'MOBILE'])

export const MyConnections = (): JSX.Element => {
  const myPhoneNumber = useContext(UserApiContext)!.phoneNumber
  const frontendService = useContext(FrontendServiceContext)!
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [error, setError] = useState<string>()

  const myFriends = useAppSelector((state) => state.MyConnectionsSlice)
  const dispatch = useAppDispatch()

  const [contacts, setContacts] = useState<Array<ContactModel>>([])

  function clearContacts() {
    setContacts([])
  }

  function getContactName(contact: Contacts.Contact): string | undefined {
    if (contact.displayName) {
      return contact.displayName
    }
    if (contact.givenName && contact.familyName) {
      return `${contact.givenName} ${contact.familyName}`
    }
    if (contact.givenName) {
      return contact.givenName
    }
    return undefined
  }

  async function openContacts() {
    return fetchContacts()
      .then((contacts) => {
        const uniqueKeys = new Set<string>()
        const models: Array<ContactModel> = []
        // Iterate from back which are more recent.
        for (let contactIdx = contacts.length - 1; contactIdx >= 0; contactIdx--) {
          const contact = contacts[contactIdx]
          const name = getContactName(contact)
          if (name) {
            for (const phoneNumberRecord of contact.phoneNumbers) {
              const phoneNumber = parsePhoneNumber(phoneNumberRecord.number, 'US')
              if (phoneNumber && phoneNumber.isValid()
                && phoneNumber.country === 'US'
                && ALLOWED_PHONE_NUMBER_TYPES.has(phoneNumber.getType())
                && phoneNumber.number !== myPhoneNumber) {
                // Keep at most one instance for each phone number.
                const uniqueKey = phoneNumber.number
                if (!uniqueKeys.has(uniqueKey)) {
                  uniqueKeys.add(uniqueKey)
                  models.push({
                    Name: name,
                    PhoneNumber: phoneNumber,
                    Label: phoneNumberRecord.label,
                  })
                }
              }
            }
          }
        }
        setContacts(Array.from(models).sort(compareContacts))
      }).catch((err) => {
        if (err === ERROR_CONTACTS_PERMISSION_NOT_GRANTED) {
          // User has declined access to their contacts.
          return
        }
        setError(err)
      })
  }

  async function addConnection(targetUser: UserInfo) {
    return frontendService.addConnection(targetUser)
      .then((result) => dispatch(addOutgoingConnection(result)))
      .catch(setError)
  }

  return (
    <ScrollView style={{ flex: 1, flexGrow: 1 }}>

      {/** Users that are bilaterally connected with you. */}
      {myFriends.Connections.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 6,
          }}
        >
          <Card.Title title="Connections" titleVariant='titleMedium' />
          <Card.Content>
            {
              myFriends.Connections.map((user) => {
                return (
                  <ConnectionCard
                    key={user.UserID}
                    user={user}
                  />
                )
              })
            }
          </Card.Content>
        </Card>
      }

      {/** Users that invite asked to connect with you. */}
      {myFriends.Incoming.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 6,
          }}
        >
          <Card.Title title="Incoming" titleVariant='titleMedium' />
          <Card.Content>
            {
              myFriends.Incoming.map((targetUser) => {
                return (
                  <ConnectionCard
                    key={targetUser.UserID}
                    user={targetUser}
                    actions={[{
                      icon: 'check',
                      label: 'Accept',
                      callback: () => addConnection(targetUser),
                      completed: isUserIn(targetUser, myFriends.Connections),
                    }]}
                  />
                )
              })
            }
          </Card.Content>
        </Card>
      }

      {/** Users that have invited you to use the app. */}
      {myFriends.Inviters.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 6,
          }}
        >
          <Card.Title title="Peeps That Invited You" titleVariant='titleMedium' />
          <Card.Content>
            {
              myFriends.Inviters.map((targetUser) => {
                return (
                  <ConnectionCard
                    key={targetUser.UserID}
                    user={targetUser}
                    actions={[{
                      icon: 'plus',
                      label: 'Connect',
                      callback: () => addConnection(targetUser),
                      completed: isUserIn(targetUser, myFriends.Connections) || isUserIn(targetUser, myFriends.Outgoing),
                    }]}
                  />
                )
              })
            }
          </Card.Content>
        </Card>
      }

      {/** Outgoing connection requests that haven't been accepted yet. */}
      {myFriends.Outgoing.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 6,
          }}
        >
          <Card.Title title="Outgoing" titleVariant='titleMedium' />
          <Card.Content>
            {
              myFriends.Outgoing.map((user) => {
                return (
                  <ConnectionCard
                    key={user.UserID}
                    user={user}
                  />
                )
              })
            }
          </Card.Content>
        </Card>
      }

      {/** Contacts (not users) that you have invited to use the app via their phone number. */}
      {myFriends.Invites.length === 0 &&
        <Text style={{ paddingVertical: 6, textAlign: 'center' }} variant="bodyLarge">
          Invite more peeps, make more friends!
        </Text>
      }
      {myFriends.Invites.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 6,
          }}
        >
          <Card.Title title="Contacts You've Invited" titleVariant='titleMedium' />
          <Card.Content>
            {
              myFriends.Invites.map((invite) => <InviteCard key={invite.ID} invite={invite} />)
            }
          </Card.Content>
        </Card>
      }

      <Portal>
        <Modal
          contentContainerStyle={styles.fullscreen}
          dismissable
          onDismiss={clearContacts}
          visible={contacts.length > 0}
        >
          <ContactsPage
            invited={myFriends.Invites}
            contacts={contacts}
            inviteCallback={(invite) => dispatch(addInvite(invite))}
            close={clearContacts}
          />
        </Modal>
        <FAB.Group
          actions={[
            {
              icon: 'phone',
              label: 'Phone Number',
              onPress: () => { },
            },
            // Contacts only on Android and iOS.
            ...(Platform.OS === 'android' || Platform.OS === 'ios') ? [{
              icon: 'contacts',
              label: 'Contact',
              onPress: openContacts,
            }] : [],
          ]}
          icon={isFabOpen ? 'minus' : 'plus'}
          onStateChange={({ open }) => setIsFabOpen(open)}
          open={isFabOpen}
          visible={contacts.length === 0}
        />
        <Snackbar style={styles.snackbar}
          onDismiss={() => setError(undefined)}
          visible={!!error}
        >
          {`Something went wrong: ${error}`}
        </Snackbar>
      </Portal>
    </ScrollView>
  )
}