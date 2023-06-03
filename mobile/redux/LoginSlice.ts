import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { LoginContextModel } from '../Models'

interface LoginState {
  loginContext?: LoginContextModel
}

const initialState: LoginState = {}

export const LoginSlice = createSlice({
  name: 'Login',
  initialState,
  reducers: {
    setLoginContext: (state, action: PayloadAction<LoginContextModel>) => {
      state.loginContext = action.payload
    },
  },
})

export const { setLoginContext } = LoginSlice.actions

export default LoginSlice.reducer