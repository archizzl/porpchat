import { Thread } from '../types';
import api from './config';

const THREAD_API_URL = `${process.env.REACT_APP_SERVER_URL}/thread`;

const getThreads = async (username: string): Promise<Thread[]> => {
  const res = await api.get(`${THREAD_API_URL}/getThreads?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching threads');
  }
  return res.data;
};

/**
 * Function to get a thread by its ID.
 *
 * @param tid - The ID of the thread to retrieve.
 * @param username - The username of the user requesting the thread.
 * @throws Error if there is an issue fetching the thread by ID.
 */
const getThreadById = async (tid: string, username: string): Promise<Thread> => {
  const res = await api.get(`${THREAD_API_URL}/getThreadById/${tid}?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching question by id');
  }
  return res.data;
};

/**
 * Function to add a new thread.
 *
 * @param t - The thread object to add.
 * @throws Error if there is an issue creating the new thread.
 */
const addThread = async (t: Thread): Promise<Thread> => {
  const res = await api.post(`${THREAD_API_URL}/addThread`, t);
  if (res.status !== 200) {
    throw new Error('Error while creating a new thread');
  }

  return res.data;
};

export { getThreads, getThreadById, addThread };
