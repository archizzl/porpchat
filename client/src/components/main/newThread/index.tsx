import useNewThread from '../../../hooks/useNewThread';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import './index.css';

/**
 * NewThreadPage component allows users to submit a new thread to chat with another user.
 */
const NewThreadPage = () => {
  const { recipient, setRecipient, recipientErr, postThread } = useNewThread();

  return (
    <Form>
      <Input
        title={'Thread Recipient'}
        hint={'must be valid username'}
        id={'formTitleInput'}
        val={recipient}
        setState={setRecipient}
        err={recipientErr}
      />
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            postThread();
          }}>
          Create Thread
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewThreadPage;
