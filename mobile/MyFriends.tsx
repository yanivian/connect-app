import parsePhoneNumber, { NumberType } from 'libphonenumber-js'
import React, { useState } from 'react'
import { PermissionsAndroid, ScrollView, StyleSheet, View } from 'react-native'
import Contacts from 'react-native-contacts'
import { ActivityIndicator, Card, FAB, IconButton, Modal, Portal, Snackbar, Text, useTheme } from 'react-native-paper'
import { compareContacts, compareInvites } from './Compare'
import { ContactModel, InviteModel } from './Models'
import { MyContacts } from './MyContacts'
import { delayedPromise, useMutatingState } from './React'
import styles from './Styles'

const PERMISSION_NOT_GRANTED = 'NOT_GRANTED'
const ALLOWED_PHONE_NUMBER_TYPES = new Set<NumberType>(['FIXED_LINE_OR_MOBILE', 'MOBILE'])

type InviteState = 'ACTIVE' | 'DELETING'

interface InviteCardProps {
  invite: InviteModel
  state: InviteState
  deleteCallback: () => void
}

function InviteCard(props: InviteCardProps): JSX.Element {
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
      <View style={[localStyles.inviteActionsContainer, { paddingLeft: 6 }]}>
        {props.state === 'ACTIVE' &&
          <IconButton
            icon='delete'
            mode='contained-tonal'
            onPress={props.deleteCallback}
          />
        }
        {props.state === 'DELETING' &&
          <ActivityIndicator animating={true} size='small' />
        }
      </View>
    </View>
  )
}

export const MyFriends = (): JSX.Element => {
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [error, setError] = useState<string>()

  const [invites, invitesRef, setInvites] = useMutatingState<Array<InviteModel>>([])

  async function mergeInvites(newInvites: Array<InviteModel>) {
    const setOfNewInviteIDs = new Set(newInvites.map((invite) => invite.ID))
    const mergedInvites = [...newInvites]
    for (const invite of invitesRef.current) {
      if (!setOfNewInviteIDs.has(invite.ID)) {
        mergedInvites.push(invite)
      }
    }
    setInvites(mergedInvites.sort(compareInvites))
  }

  const [deletingInvites, deletingInvitesRef, setDeletingInvites] = useMutatingState<Array<InviteModel>>([])

  async function deleteInvite(invite: InviteModel): Promise<void> {
    setDeletingInvites([...deletingInvitesRef.current, invite])
    // TODO: Persist invite deletion via frontend.
    return delayedPromise(3000, undefined)
      .then(() => {
        setDeletingInvites(deletingInvitesRef.current.filter((i) => i !== invite))
        setInvites(invitesRef.current.filter((i) => i !== invite))
      })
  }

  function determineInviteState(invite: InviteModel): InviteState {
    if (deletingInvites.includes(invite)) {
      return 'DELETING'
    }
    return 'ACTIVE'
  }

  const [contacts, setContacts] = useState<Array<ContactModel>>([])

  function clearContacts() {
    setContacts([])
  }

  async function openContacts() {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
      .then((status) => {
        if (status !== 'granted') {
          return Promise.reject(PERMISSION_NOT_GRANTED)
        }
        return Contacts.getAllWithoutPhotos()
      }).then((contacts) => {
        const uniqueKeys = new Set<string>()
        const models: Array<ContactModel> = []
        // Iterate from back which are more recent.
        for (let contactIdx = contacts.length - 1; contactIdx >= 0; contactIdx--) {
          const contact = contacts[contactIdx]
          const name = contact.displayName
          if (name) {
            for (const phoneNumberRecord of contact.phoneNumbers) {
              const label = phoneNumberRecord.label
              const phoneNumber = parsePhoneNumber(phoneNumberRecord.number, 'US')
              if (phoneNumber && phoneNumber.isValid()
                && phoneNumber.country === 'US'
                && ALLOWED_PHONE_NUMBER_TYPES.has(phoneNumber.getType())) {
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
        if (err === PERMISSION_NOT_GRANTED) {
          // User has declined access to their contacts.
          return
        }
        setError(err)
      })
  }

  return (
    <ScrollView style={{ flex: 1, flexGrow: 1 }}>
      {invites.length === 0 &&
        <Text style={{ paddingTop: 18, textAlign: 'center' }} variant="bodyLarge">
          Invite more peeps, make more friends!
        </Text>
      }
      {invites.length > 0 &&
        <Card
          mode='outlined'
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <Card.Title title='Invites' titleVariant='titleMedium' />
          <Card.Content>
            {invites.map((invite) => {
              return (
                <InviteCard
                  deleteCallback={() => deleteInvite(invite)}
                  invite={invite}
                  key={invite.ID}
                  state={determineInviteState(invite)}
                />
              )
            }
            )}
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
          <MyContacts
            invited={invites}
            contacts={contacts}
            inviteCallback={mergeInvites}
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
            {
              icon: 'contacts',
              label: 'Contact',
              onPress: openContacts,
            },
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

const localStyles = StyleSheet.create({
  inviteActionsContainer: {
    height: 40,
    width: 40,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
})