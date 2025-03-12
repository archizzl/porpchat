import { createContext } from 'react';
import { FakeSOSocket, Porp } from '../types';

/**
 * Interface represents the context type for user-related data and a WebSocket connection.
 *
 * - user - the current user.
 * - socket - the WebSocket connection associated with the current user.
 */
export interface PorpContextType {
  porp: Porp;
  socket: FakeSOSocket;
}

const PorpContext = createContext<PorpContextType | null>(null);

export default PorpContext;
