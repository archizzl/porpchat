import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAccountContext from './useAccountContext';
import { Thread, Message } from '../types';
import { getThreadById } from '../services/threadService';
import { addMessage, readMessage } from '../services/messageService';

/**
 * Custom hook for managing the thread page state, filtering, and real-time updates.
 *
 * @returns messages - The list of messages
 * @returns account - the active account
 * @returns socket - the socket
 */
const useThreadPage = () => {
  const { tid } = useParams();
  const { account, socket } = useAccountContext();
  const [threadID, setThreadID] = useState<string>(tid || '');
  const [message, setMessage] = useState<string>('');
  const [thread, setThread] = useState<Thread>();
  const [messages, setMessages] = useState<Message[]>();

  const handleAddMessage = async (m: Message, t: string | undefined) => {
    try {
      if (t === undefined) {
        throw new Error('No thread ID provided.');
      }

      await addMessage(t, m);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding message:', error);
    }
  };

  const handleReadMessage = async (m: Message | undefined, username: string) => {
    try {
      if (m === undefined || m?._id === undefined) {
        throw new Error('No message provided.');
      }

      await readMessage(m._id, username);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reading message:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getThreadById(threadID, account.username);
        setThread(res || null);
        setMessages(res.messages || null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching thread:', error);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(e => console.log(e));
  }, [threadID, account.username]);

  const handleAddMessageClick = () => {
    if (message.trim() === '' || account.username.trim() === '') {
      return;
    }

    const newMessage: Message = {
      content: message,
      sender: account.username,
      messageDateTime: new Date(),
      views: [account.username],
      likes: [],
    };

    handleAddMessage(newMessage, tid);
    setMessage('');
  };

  useEffect(() => {
    const handleMessageUpdate = ({ result }: { result: Thread }) => {
      if (result._id === tid) {
        setThread(result);
        setMessages(result.messages);
        handleReadMessage(result.messages[result.messages.length - 1], account.username);
      }
    };

    socket.on('messageUpdate', handleMessageUpdate);

    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [tid, socket, account.username]);

  return {
    account,
    threadID,
    setThreadID,
    message,
    setMessage,
    socket,
    thread,
    setThread,
    messages,
    setMessages,
    handleAddMessageClick,
  };
};

export default useThreadPage;
