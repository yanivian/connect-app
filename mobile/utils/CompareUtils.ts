import { ChatGistModel, ChatMessageModel, ContactModel, InviteModel } from "../Models"

interface SortBy<T extends Object> {
  value: (obj: T) => any
  order: 'ASC' | 'DESC'
}

function compare<T extends Object>(obj1: T, obj2: T, sortByList: Array<SortBy<T>>): -1 | 0 | 1 {
  for (const sortBy of sortByList) {
    const val1 = sortBy.value(obj1)
    const val2 = sortBy.value(obj2)
    if (!val1 && !val2) {
      continue
    }
    if (!val1) {
      return sortBy.order === 'ASC' ? -1 : 1
    }
    if (!val2) {
      return sortBy.order === 'ASC' ? 1 : -1
    }
    if (val1 < val2) {
      return sortBy.order === 'ASC' ? -1 : 1
    }
    if (val1 > val2) {
      return sortBy.order === 'ASC' ? 1 : -1
    }
  }
  return 0
}

export function compareChatGists(first: ChatGistModel, second: ChatGistModel): -1 | 0 | 1 {
  return compare(first, second, [
    { value: (model) => model.LatestMessage.MessageID, order: 'ASC' },
    { value: (model) => model.LastSeenMessageID, order: 'ASC' },
  ] as Array<SortBy<ChatGistModel>>)
}

export function compareChatMessages(first: ChatMessageModel, second: ChatMessageModel): -1 | 0 | 1 {
  return compare(first, second, [
    { value: (model) => model.MessageID, order: 'ASC' },
    { value: (model) => model.CreatedTimestampMillis, order: 'ASC' },
  ] as Array<SortBy<ChatMessageModel>>)
}

export function compareContacts(first: ContactModel, second: ContactModel): -1 | 0 | 1 {
  return compare(first, second, [
    { value: (model) => model.Name, order: 'ASC' },
    { value: (model) => model.Label, order: 'ASC' },
    { value: (model) => model.PhoneNumber, order: 'ASC' },
  ] as Array<SortBy<ContactModel>>)
}

export function compareInvites(first: InviteModel, second: InviteModel): -1 | 0 | 1 {
  return compare(first, second, [
    { value: (model) => model.Name, order: 'ASC' },
    { value: (model) => model.PhoneNumber, order: 'ASC' },
  ])
}