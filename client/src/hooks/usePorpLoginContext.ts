import { useContext } from 'react';
import PorpLoginContext, { PorpLoginContextType } from '../contexts/PorpLoginContext';

/**
 * Custom hook to access the LoginContext.
 *
 * @throws It will throw an error if the `LoginContext` is null.
 *
 * @returns context - the context value for managing login state, including the `setUser` function.
 */
const usePorpLoginContext = (): PorpLoginContextType => {
  const context = useContext(PorpLoginContext);

  if (context === null) {
    throw new Error('Porp context is null.');
  }

  return context;
};

export default usePorpLoginContext;
