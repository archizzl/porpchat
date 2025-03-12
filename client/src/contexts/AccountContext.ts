import { createContext } from 'react';
import { FakeSOSocket, Account } from '../types';

/**
 * Interface represents the context type for user-related data and a WebSocket connection.
 *
 * - user - the current user.
 * - socket - the WebSocket connection associated with the current user.
 */
export interface AccountContextType {
  account: Account;
  socket: FakeSOSocket;
  setAccount: (account: Account) => void;
}

const AccountContext = createContext<AccountContextType | null>(null);

export default AccountContext;
