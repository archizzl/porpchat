import { useEffect, useState } from 'react';
import useAccountContext from './useAccountContext';
import { Forum } from '../types';
import { getForums } from '../services/forumService';

/**
 * Custom hook for managing the question page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the question page
 * @returns qlist - The list of questions to display
 * @returns setQuestionOrder - Function to set the sorting order of questions (e.g., newest, oldest).
 */
const useForumPage = () => {
  const { socket, account } = useAccountContext();
  const [flist, setFlist] = useState<Forum[]>([]);

  useEffect(() => {
    /**
     * Function to fetch questions based on the filter and update the question list.
     */
    const fetchData = async () => {
      try {
        const res = await getForums(account.username);
        setFlist(res || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    /**
     * Function to handle question updates from the socket.
     *
     * @param question - the updated question object.
     */
    const handleForumUpdate = (forum: Forum) => {
      setFlist(prevFlist => {
        const forumExists = prevFlist.some(q => q._id === forum._id);

        if (forumExists) {
          // Update the existing forum
          return prevFlist.map(f => (f._id === forum._id ? forum : f));
        }

        return [...prevFlist, forum];
      });
    };

    fetchData();

    socket.on('forumUpdate', handleForumUpdate);

    return () => {
      socket.off('forumUpdate', handleForumUpdate);
    };
  }, [socket, account.username]);

  return { flist };
};

export default useForumPage;
