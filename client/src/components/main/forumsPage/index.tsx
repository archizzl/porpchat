import './index.css';
import ForumView from './forum';
import useForumPage from '../../../hooks/useForumPage';
import StartForumButton from './startForumButton';

/**
 * ForumsPage component renders a page displaying a list of forums
 */
const ForumsPage = () => {
  const { flist } = useForumPage();

  return (
    <div id='forums_page'>
      <div id='forums_list' className='forums_list'>
        {flist.map((f, idx) => (
          <ForumView f={f} key={idx} />
        ))}
      </div>
      <StartForumButton />
    </div>
  );
};

export default ForumsPage;
