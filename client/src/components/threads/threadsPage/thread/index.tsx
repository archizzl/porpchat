import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { Thread } from '../../../../types';
import useAccountContext from '../../../../hooks/useThreadsPage';

/**
 * Interface representing the props for the Thread component.
 *
 * t - The thread object containing details about the thread.
 */
interface ThreadProps {
  t: Thread;
}

/**
 * Thread component renders the details of a thread
 * Clicking on the component triggers the handleThread function
 *
 * @param t - The thread object containing thread details.
 */
const ThreadPreview = ({ t }: ThreadProps) => {
  const { account } = useAccountContext();
  const navigate = useNavigate();
  /**
   * Function to navigate to the specified thread page based on the thread ID.
   *
   * @param tid - The ID of the thread to navigate to.
   */
  const handleThread = (tid: string) => {
    navigate(`/threads/${tid}`);
  };

  // Check if account.username is not in the views of the last message
  const isRead =
    t.messages.length > 0 && !t.messages[t.messages.length - 1].views.includes(account.username);
  return (
    <div
      className={`thread_preview ${isRead ? 'thread_preview_bold' : ''}`}
      onClick={() => {
        if (t._id) {
          handleThread(t._id);
        }
      }}>
      <div className='threadWith'>
        <div>{t.accounts.filter(un => un !== account.username)[0]}</div>
      </div>
      {t.messages.length > 0 && (
        <>
          <div className='threadSnippet'>{t.messages[t.messages.length - 1].content}</div>
          <div className='threadLastActivity'>
            <div className='thread_meta'>
              {getMetaData(new Date(t.messages[t.messages.length - 1].messageDateTime))}
            </div>
          </div>
        </>
      )}
      {t.messages.length === 0 && (
        <>
          <div className='thread_mid'>
            <div className='threadSnippet'>{'Nothing yet. . .'}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadPreview;
