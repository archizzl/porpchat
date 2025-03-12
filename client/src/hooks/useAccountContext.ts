import { useContext } from 'react';
import AccountContext from '../contexts/AccountContext';
import LoginContext from '../contexts/LoginContext';

/**
 * Custom hook to access the current user context.
 *
 * @returns context - Returns the user context object, which contains user and socket information.
 *
 * @throws it will throw an error if the context is not found or is null.
 */
const useAccountContext = () => {
  const account = useContext(AccountContext);
  const login = useContext(LoginContext);

  if (!account) {
    throw new Error('Account context is null.');
  }

  if (!login) {
    throw new Error('Login context is null.');
  }

  return {
    ...account,
    setAccount: login.setAccount,
  };
};

export default useAccountContext;
