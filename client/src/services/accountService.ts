import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Account } from '../types';
import api from './config';
import app, { db } from './firebaseService';

const auth = getAuth(app);

const ACCOUNT_API_URL = `${process.env.REACT_APP_SERVER_URL}/account`;

/**
 * Function to add a new question.
 *
 * @param q - The question object to add.
 * @throws Error if there is an issue creating the new question.
 */
const addAccount = async (a: Account): Promise<Account> => {
  const res = await api.post(`${ACCOUNT_API_URL}/addAccount`, a);
  if (res.status !== 200) {
    throw new Error('Error while creating a new thread');
  }

  return res.data;
};

/**
 * Function to add a new question.
 *
 * @param q - The question object to add.
 * @throws Error if there is an issue creating the new question.
 */
const getAccount = async (a: Account): Promise<Account> => {
  const res = await api.post(`${ACCOUNT_API_URL}/findOrCreateAccount`, a);
  if (res.status !== 200) {
    throw new Error('Error while creating a new thread');
  }

  return res.data;
};

/**
 * Function to authenticate an account
 *
 * @param username - the username to authenticate
 * @param password - the password to authenticate
 * @throws Error if there is an issue authenticating the account
 */
const authenticateAccount = async (username: string, password: string): Promise<Account> => {
  try {
    // Fetch the email associated with the username from Firestore
    const usernameDocRef = doc(db, 'usernames', username);
    const usernameDoc = await getDoc(usernameDocRef);

    if (!usernameDoc.exists()) throw new Error('Username does not exist');
    const { email } = usernameDoc.data() as { email: string };

    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const res = await api.post(`${ACCOUNT_API_URL}/findOrCreateAccount`, {
      username,
      email,
    });

    // Return user information directly from Firebase
    return {
      username,
      email,
      createdAt: new Date(userCredential.user.metadata.creationTime || Date.now()),
      accessibilitySettings: res.data.accessibilitySettings,
    } as Account;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Authentication failed');
  }
};

/**
 * Function to log in using Google SSO.
 *
 * @returns Firebase user object.
 */
const loginWithGoogle = async (): Promise<Account> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    // Check if the user already exists in MongoDB
    const res = await api.post(`${ACCOUNT_API_URL}/findOrCreateAccount`, {
      username: user.displayName || user.email || 'Anonymous',
      email: user.email,
    });

    return {
      username: res.data.username,
      email: res.data.email,
      createdAt: res.data.createdAt,
      accessibilitySettings: res.data.accessibilitySettings,
    };
  } catch (error) {
    throw new Error('Failed to log in with Google');
  }
};

/**
 * Function to log in using GitHub SSO.
 *
 * @returns Firebase user object.
 */

const loginWithGithub = async (): Promise<Account> => {
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    // Check if the user already exists in MongoDB
    const res = await api.post(`${ACCOUNT_API_URL}/findOrCreateAccount`, {
      username: user.displayName || user.email || 'Anonymous',
      email: user.email,
    });

    return {
      username: res.data.username,
      email: res.data.email,
      createdAt: res.data.createdAt,
      accessibilitySettings: res.data.accessibilitySettings,
    };
  } catch (error) {
    throw new Error('Failed to log in with GitHub');
  }
};

/**
 * Sends a password reset email to the user.
 *
 * @param email - The email address of the user who needs to reset their password.
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export {
  addAccount,
  getAccount,
  loginWithGoogle,
  loginWithGithub,
  authenticateAccount,
  sendPasswordResetEmail,
};
