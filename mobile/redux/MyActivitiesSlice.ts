import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ActivityModel } from '../Models'

interface MyActivitiesState {
  created: Array<ActivityModel>
}

const initialState: MyActivitiesState = {
  created: [],
}

export const MyActivitiesSlice = createSlice({
  name: 'MyActivities',
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<ActivityModel>) => {
      state.created = [
        action.payload,
        ...state.created.filter((a) => a.ID !== action.payload.ID),
      ]
    },
    deleteActivityById: (state, action: PayloadAction<String>) => {
      state.created = state.created.filter((a) => a.ID !== action.payload)
    },
  },
})

export const { addActivity, deleteActivityById } = MyActivitiesSlice.actions

export default MyActivitiesSlice.reducer