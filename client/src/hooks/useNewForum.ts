import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addForum } from '../services/forumService';
import { Forum } from '../types';

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
const useNewForum = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!name) {
      setTextErr('Name cannot be empty');
      isValid = false;
    }

    if (!description) {
      setTextErr('Description cannot be empty');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postForum = async () => {
    if (!validateForm()) return;

    const forum: Forum = {
      name,
      description,
      thread: '',
    };

    try {
      const res = await addForum(forum);

      if (res && res._id) {
        navigate('/forums');
        setTextErr('');
      }
    } catch (error) {
      setTextErr('User does not exist or thread already exists');
    }
  };

  return {
    name,
    setName,
    description,
    setDescription,
    postForum,
    textErr,
    setTextErr,
  };
};

export default useNewForum;
