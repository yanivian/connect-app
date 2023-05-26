import { ContactModel, InviteModel } from "./Models"

interface SortBy {
  key: string
  order: 'ASC' | 'DESC'
}

function compare<T extends Object>(obj1: T, obj2: T, sortByList: Array<SortBy>): -1 | 0 | 1 {
  for (const sortBy of sortByList) {
    const val1 = Object.entries(obj1).filter(([key]) => key === sortBy.key)[0]
    const val2 = Object.entries(obj2).filter(([key]) => key === sortBy.key)[0]
    if (val1 < val2) {
      return sortBy.order === 'ASC' ? -1 : 1
    }
    if (val1 > val2) {
      return sortBy.order === 'ASC' ? 1 : -1
    }
  }
  return 0
}

export function compareContacts(first: ContactModel, second: ContactModel): -1 | 0 | 1 {
  return compare(first, second, [
    { key: 'Name', order: 'ASC' },
    { key: 'Label', order: 'ASC' },
    { key: 'PhoneNumber', order: 'ASC' },
  ])
}

export function compareInvites(first: InviteModel, second: InviteModel): -1 | 0 | 1 {
  return compare(first, second, [
    { key: 'Name', order: 'ASC' },
    { key: 'PhoneNumber', order: 'ASC' },
  ])
}