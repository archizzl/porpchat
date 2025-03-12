import './index.css';
import ThreadPreview from './thread';
import useThreadsPage from '../../../hooks/useThreadsPage';
import StartThreadButton from './startThreadButton';

const ThreadsPage = () => {
  const { tlist } = useThreadsPage();
  return (
    <div id='threads_page'>
      <div id='threads_list' className='threads_list'>
        {tlist.map((t, idx) => (
          <ThreadPreview t={t} key={idx} />
        ))}
      </div>
      <StartThreadButton />
    </div>
  );
};

export default ThreadsPage;
