export type IsEqual<T> = (x: T, y: T) => boolean

export function arrayFind<T>(item: T, list: Array<T>, isEqual: IsEqual<T>): Array<T> {
  return list.filter((i) => isEqual(i, item))
}

export function arrayRemove<T>(item: T, list: Array<T>, isEqual: IsEqual<T>) {
  return list.filter((i) => !isEqual(i, item))
}

export function arrayUpsert<T>(item: T, list: Array<T>, isEqual: IsEqual<T>) {
  let found = false
  const updated = list.map((i) => {
    if (isEqual(i, item)) {
      found = true
      return item
    }
    return i
  })
  if (!found) {
    updated.push(item)
  }
  return updated
}