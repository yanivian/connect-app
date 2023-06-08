/** This file contains various contexts. */

import { createContext } from 'react';
import { UserApi } from './Models';
import FrontendService from './FrontendService';

/** React context with an UserModel value type. */
export const UserApiContext = createContext<UserApi | null>(null)

/** React context to access the frontend service. */
export const FrontendServiceContext = createContext<FrontendService | null>(null)