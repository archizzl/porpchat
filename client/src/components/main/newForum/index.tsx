import useNewForum from '../../../hooks/useNewForum';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import './index.css';

/**
 * NewForumPage component allows users to submit a new forum with a name, and description.
 */
const NewForumPage = () => {
  const { name, setName, description, setDescription, textErr, postForum } = useNewForum();

  return (
    <Form>
      <Input
        title={'Forum Name'}
        id={'formTitleInput'}
        val={name}
        setState={setName}
        err={textErr}
      />
      <Input
        title={'Forum Description'}
        id={'formTitleInput'}
        val={description}
        setState={setDescription}
        err={textErr}
      />
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            postForum();
          }}>
          Create Forum
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewForumPage;
