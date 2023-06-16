import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { DeviceContactsModel } from '../Models'

const initialState: DeviceContactsModel = {
  Users: undefined,
}

export const DeviceContactsSlice = createSlice({
  name: 'DeviceContacts',
  initialState,
  reducers: {
    refresh: (state, action: PayloadAction<DeviceContactsModel>) => {
      Object.assign(state, { ...initialState, ...action.payload })
    },
  },
})

export const { refresh } = DeviceContactsSlice.actions

export default DeviceContactsSlice.reducer