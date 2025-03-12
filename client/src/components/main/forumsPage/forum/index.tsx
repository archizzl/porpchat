import { useNavigate } from 'react-router-dom';
import './index.css';
import { Forum } from '../../../../types';

/**
 * Interface representing the props for the Forum component.
 *
 * f - The forum object containing details about the forum.
 */
interface ForumProps {
  f: Forum;
}

/**
 * Forum component renders the details of a forum.
 * Clicking on the component triggers the handleThread function,
 *
 * @param f - The question object containing forum details.
 */
const ForumView = ({ f }: ForumProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the specified thread page based on the thread ID
   * attached to the forum.
   *
   * @param threadID - The ID of the thread to navigate to.
   */
  const handleThread = (tid: string) => {
    navigate(`/threads/${tid}`);
  };

  return (
    <div
      className='forum_preview'
      onClick={() => {
        if (f.thread) {
          handleThread(f.thread);
        }
      }}>
      <div className='forum_name'>{f.name}</div>
      <hr />
      <div className='forum_description'>{f.description}</div>
    </div>
  );
};

export default ForumView;
