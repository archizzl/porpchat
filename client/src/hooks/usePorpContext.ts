import { useContext } from 'react';
import PorpContext, { PorpContextType } from '../contexts/PorpContext';

/**
 * Custom hook to access the current user context.
 *
 * @returns context - Returns the user context object, which contains user and socket information.
 *
 * @throws it will throw an error if the context is not found or is null.
 */
const usePorpContext = (): PorpContextType => {
  const context = useContext(PorpContext);

  if (context === null) {
    throw new Error('User context is null.');
  }

  return context;
};

export default usePorpContext;
