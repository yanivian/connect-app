/** This file contains various contexts. */

import { createContext } from 'react';
import { LoginContextModel, ProfileModel, UserModel } from './Models';

/** React context with a LoginContextModel value type. */
export const LoginContext = createContext<LoginContextModel | null>(null)

/** React context with a ProfileModel value type. */
export const ProfileModelContext = createContext<ProfileModel | null>(null)

/** React context with an UserModel value type. */
export const UserModelContext = createContext<UserModel | null>(null)