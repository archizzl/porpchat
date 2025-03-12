import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addThread } from '../services/threadService';
import useAccountContext from './useAccountContext';
import { Thread } from '../types';

/**
 * Custom hook to handle question submission and form validation
 *
 * @returns title - The current value of the title input.
 * @returns text - The current value of the text input.
 * @returns tagNames - The current value of the tags input.
 * @returns titleErr - Error message for the title field, if any.
 * @returns textErr - Error message for the text field, if any.
 * @returns tagErr - Error message for the tag field, if any.
 * @returns postQuestion - Function to validate the form and submit a new question.
 */
const useNewThread = () => {
  const navigate = useNavigate();
  const { account } = useAccountContext();
  const [recipient, setRecipient] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');

  const [recipientErr, setRecipientErr] = useState<string>('');

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!recipient) {
      setRecipientErr('Recipient cannot be empty');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postThread = async () => {
    if (!validateForm()) return;

    const thread: Thread = {
      messages: [],
      accounts: [account.username, recipient],
      threadUpdatedDateTime: new Date(),
    };

    try {
      const res = await addThread(thread);

      if (res && res._id) {
        navigate('/threads');
        setRecipientErr('');
      }
    } catch (error) {
      setRecipientErr('User does not exist or thread already exists');
    }
  };

  return {
    recipient,
    setRecipient,
    postThread,
    recipientErr,
    textErr,
    setTextErr,
  };
};

export default useNewThread;
