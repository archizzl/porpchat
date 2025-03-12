import { createContext } from 'react';
import { Porp } from '../types';

/**
 * Interface representing the context type for user login management.
 *
 * - setUser - A function to update the current user in the context,
 *             which take User object representing the logged-in user or null
 *             to indicate no user is logged in.
 */
export interface PorpLoginContextType {
  setPorp: (porp: Porp | null) => void;
}

const PorpLoginContext = createContext<PorpLoginContextType | null>(null);

export default PorpLoginContext;
