import { createContext } from 'react';
import { Account } from '../types';

/**
 * Interface representing the context type for user login management.
 *
 * - setUser - A function to update the current user in the context,
 *             which take User object representing the logged-in user or null
 *             to indicate no user is logged in.
 */
export interface LoginContextType {
  setAccount: (account: Account | null) => void;
}

const LoginContext = createContext<LoginContextType | null>(null);

export default LoginContext;
