import { useRef, useState } from "react"

/** For when your state changes. ;) */
export function useMutatingState<S>(initialValue: S): [S, React.MutableRefObject<S>, React.Dispatch<S>] {
  const [state, setState] = useState(initialValue)
  const ref = useRef(state)
  const dispatcher = (value: S) => {
    setState(value)
    ref.current = value
  }
  return [state, ref, dispatcher]
}

/** For testing. =D */
export function delayedPromise<T>(delayMillis: number, value: T): Promise<T> {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), delayMillis))
}