import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { AxiosError } from 'axios';
import { auth, db } from '../services/firebaseService';
import useLoginContext from './useLoginContext';
import { addAccount } from '../services/accountService';
import { Account } from '../types';

/**
 * Custom hook to handle registration input and submission.
 *
 * @returns email - The current value of the email input.
 * @returns username - The current value of the username input.
 * @returns password - The current value of the password input.
 * @returns handleInputChange - Function to handle changes in the input fields.
 * @returns handleRegisterSubmit - Function to handle registration submission
 */
const useRegister = () => {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAccount } = useLoginContext();
  const navigate = useNavigate();

  /**
   * Function to handle the input change event for all fields.
   *
   * @param e - the event object.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    else if (name === 'username') setUsername(value);
    else if (name === 'password') setPassword(value);
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postAccount = async (): Promise<Account> => {
    const account: Account = { username, email, password, createdAt: new Date() };
    return addAccount(account);
  };

  /**
   * Function to handle the registration form submission event.
   *
   * @param event - the form event object.
   */
  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const usernameDocRef = doc(db, 'usernames', username);
      const usernameDoc = await getDoc(usernameDocRef);

      if (usernameDoc.exists()) {
        setErrorMessage('Username already in use');
        return;
      }

      // Create an account in Firebase
      const firebaseUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUserCredential.user, { displayName: username });

      // Save username-email mapping in Firestore
      await setDoc(usernameDocRef, {
        email,
        createdAt: new Date(),
      });

      // Save account details in MongoDB
      const account = await postAccount();

      // Update application state and navigate
      setAccount(account);
      navigate('/accessibility-settings');
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters');
      } else if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email already in use');
      } else if (
        error instanceof AxiosError &&
        error.response?.data?.error === 'Username already in use'
      ) {
        setErrorMessage('Username already in use');
      } else {
        setErrorMessage('Failed to register account. Please try again.');
      }
    }
  };

  return { email, username, password, errorMessage, handleInputChange, handleRegisterSubmit };
};

export default useRegister;
