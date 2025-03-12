import './index.css';
import TagView from './tag';
import useTagPage from '../../../hooks/useTagPage';

/**
 * Represents the TagPage component which displays a list of tags
 * and provides functionality to handle tag clicks and ask a new question.
 */
const TagPage = () => {
  const { tlist, clickTag } = useTagPage();

  return (
    <>
      <div className='tags_header'>
        <div className='bold_title'>All {tlist.length} Wonderful Tags</div>
      </div>
      <div className='tag_list'>
        {tlist.map((t, idx) => (
          <TagView key={idx} t={t} clickTag={clickTag} />
        ))}
      </div>
    </>
  );
};

export default TagPage;
