import api from './config';
import { Message } from '../types';

const MESSAGE_API_URL = `${process.env.REACT_APP_SERVER_URL}/message`;

/**
 * Interface extending the request body when adding a message to a thread, which contains:
 * - tid - The unique identifier of the thread being commented on
 * - msg - The message being added.
 */
interface AddMessageRequestBody {
  tid?: string;
  msg: Message;
}

/**
 * Interface extending the request body when interacting with a message, which contains:
 * - mid - The unique identifier of the message being interacted with
 * - msg - The message being added.
 */
interface InteractMessageRequestBody {
  mid?: string;
  username: string;
}

/**
 * Adds a new message to a specific thread.
 *
 * @param tid - The ID of the thread to which the message is being added.
 * @param message - The message object containing the message details.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
export const addMessage = async (tid: string, msg: Message): Promise<Message> => {
  const reqBody: AddMessageRequestBody = {
    tid,
    msg,
  };
  const res = await api.post(`${MESSAGE_API_URL}/addMessage`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while creating a new message for the thread');
  }
  return res.data;
};

/**
 * Marks a message as read
 *
 * @param mid the id of the message
 * @param username the username who read the message
 */
export const readMessage = async (mid: string, username: string): Promise<void> => {
  const reqBody: InteractMessageRequestBody = {
    mid,
    username,
  };
  const res = await api.post(`${MESSAGE_API_URL}/readMessage`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while reading a new message in the thread');
  }
  return res.data;
};

/**
 * Likes a message
 * @param mid the id of the message
 * @param username the username who likes the message
 */
export const likeMessage = async (mid: string, username: string): Promise<Message> => {
  const reqBody: InteractMessageRequestBody = {
    mid,
    username,
  };
  const res = await api.post(`${MESSAGE_API_URL}/likeMessage`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while liking a message in the thread');
  }
  return res.data;
};

export default addMessage;
