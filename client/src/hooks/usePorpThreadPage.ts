import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import usePorpContext from './usePorpContext';
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
const usePorpThreadPage = () => {
  const tid = '679291c212bafc7ecaaf84fe';
  const { porp, socket } = usePorpContext();
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
        const res = await getThreadById(threadID, porp.username);
        setThread(res || null);
        const reverse = res.messages.reverse();
        setMessages(reverse || null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching thread:', error);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(e => console.log(e));
  }, [threadID, porp.username]);

  const handleAddMessageClick = () => {
    if (message.trim() === '' || porp.username.trim() === '') {
      return;
    }

    const newMessage: Message = {
      content: message,
      sender: porp.username,
      messageDateTime: new Date(),
      views: [porp.username],
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
        handleReadMessage(result.messages[result.messages.length - 1], porp.username);
      }
    };

    socket.on('messageUpdate', handleMessageUpdate);

    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [tid, socket, porp.username]);

  return {
    porp,
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

export default usePorpThreadPage;
