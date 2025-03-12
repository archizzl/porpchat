import api from './config';
import { Question, Answer, Account } from '../types'; // Import the types

const PROFILE_API_URL = `${process.env.REACT_APP_SERVER_URL}/profile`;

/**
 * Fetches all questions asked by a specific user.
 * @param username The username of the user whose questions are being fetched.
 * @returns A promise resolving to the list of questions.
 */
export const getUserQuestions = async (username: string): Promise<Question[]> => {
  const response = await api.get(`${PROFILE_API_URL}/getQuestions?username=${username}`);
  return response.data;
};

/**
 * Fetches all answers provided by a specific user.
 * @param username The username of the user whose answers are being fetched.
 * @returns A promise resolving to the list of answers.
 */
export const getUserAnswers = async (username: string): Promise<Answer[]> => {
  const response = await api.get(`${PROFILE_API_URL}/getAnswers?username=${username}`);
  return response.data;
};

/**
 * Fetches account details for a specific user by their username.
 * This function retrieves only the username and bio.
 * @param username The username of the user to fetch.
 * @returns A promise resolving to the user's account data.
 */
export const getUserAccount = async (
  username: string,
): Promise<Pick<Account, 'username' | 'bio'>> => {
  const response = await api.get(`${PROFILE_API_URL}/getBio?username=${username}`);
  return response.data;
};

/**
 * Updates the bio of a specific user.
 * @param username The username of the user whose bio is being updated.
 * @param bio The new bio for the user.
 * @returns A promise resolving to the updated account data.
 */
export const updateUserBio = async (
  username: string,
  bio: string,
): Promise<{ message: string; user: Pick<Account, 'username' | 'bio'> }> => {
  const response = await api.put(`${PROFILE_API_URL}/updateBio`, { username, bio });
  return response.data;
};
