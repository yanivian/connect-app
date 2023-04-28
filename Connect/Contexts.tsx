/** This file contains various contexts. */

import { createContext } from 'react';
import { ProfileModel, UserModel } from './Models';

/** React context with a ProfileModel value type. */
export const ProfileModelContext = createContext<ProfileModel | null>(null)

/** React context with an UserModel value type. */
export const UserModelContext = createContext<UserModel | null>(null)