import { Forum } from '../types';
import api from './config';

const FORUM_API_URL = `${process.env.REACT_APP_SERVER_URL}/forum`;

/**
 * Function to get forums
 *
 * @param username - The username searching for the forums.
 * @throws Error if there is an issue fetching forums.
 */
const getForums = async (username: string): Promise<Forum[]> => {
  const res = await api.get(`${FORUM_API_URL}/getForums?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching forums');
  }
  return res.data;
};

/**
 * Function to add a new forum.
 *
 * @param f - The forum object to add.
 * @throws Error if there is an issue creating the new forum.
 */
const addForum = async (f: Forum): Promise<Forum> => {
  const res = await api.post(`${FORUM_API_URL}/addForum`, f);

  if (res.status !== 200) {
    throw new Error('Error while creating a new forum');
  }

  return res.data;
};

export { getForums, addForum };
