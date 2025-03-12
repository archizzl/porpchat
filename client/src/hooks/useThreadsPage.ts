import { useEffect, useState } from 'react';
import useAccountContext from './useAccountContext';
import { Thread } from '../types';
import { getThreads } from '../services/threadService';

/**
 * Custom hook for managing the threads page state, filtering, and real-time updates.
 *
 * @returns tlist - The list of threads
 * @returns activethread - the active thread
 * @returns setActiveThread - function to set the active thread
 * @returns account - the account
 * @returns socket - the socket
 */
const useThreadsPage = () => {
  const { account, socket } = useAccountContext();

  const [tlist, setTlist] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread>();

  useEffect(() => {
    /**
     * Function to fetch threads based on the logged in user
     */
    const fetchData = async () => {
      try {
        const res = await getThreads(account.username);
        setTlist(res || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };
    const handleThreadUpdate = (thread: Thread) => {
      if (thread.accounts.includes(account.username)) {
        setTlist(prevTlist => {
          // Check if the thread is already in the list
          const threadExists = prevTlist.some(t => t._id === thread._id);
          // If the thread is not in the list, add it
          if (!threadExists) {
            prevTlist.push(thread);
          }
          // Sort the list by threadDateTime (assuming it's a Date object or a string that can be parsed into a Date)
          return prevTlist
            .slice() // Make a shallow copy of the array before mutating it
            .sort(
              (a, b) =>
                new Date(b.threadUpdatedDateTime).getTime() -
                new Date(a.threadUpdatedDateTime).getTime(),
            );
        });
      }
    };

    const handleMessageUpdate = ({ result }: { result: Thread }) => {
      if (result.accounts.includes(account.username)) {
        setTlist(prevTlist => {
          // Check if the thread already exists in the list
          const threadIndex = prevTlist.findIndex(t => t._id === result._id);

          // If the thread exists, replace it with the new thread
          if (threadIndex !== -1) {
            // Replace the thread in the array
            prevTlist[threadIndex] = result;
          } else {
            // If it doesn't exist, add the new thread to the list
            prevTlist.push(result);
          }

          // Return the updated list, sorted by threadDateTime
          return prevTlist
            .slice() // Make a shallow copy of the array
            .sort(
              (a, b) =>
                new Date(b.threadUpdatedDateTime).getTime() -
                new Date(a.threadUpdatedDateTime).getTime(),
            );
        });
      }
    };

    fetchData();

    socket.on('threadUpdate', handleThreadUpdate);
    socket.on('messageUpdate', handleMessageUpdate);

    return () => {
      socket.off('threadUpdate', handleThreadUpdate);
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [socket, account.username]);

  return { tlist, activeThread, setActiveThread, account, socket };
};

export default useThreadsPage;
