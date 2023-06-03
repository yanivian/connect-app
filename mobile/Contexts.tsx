/** This file contains various contexts. */

import { createContext } from 'react';
import { UserApi } from './Models';

/** React context with an UserModel value type. */
export const UserApiContext = createContext<UserApi | null>(null)