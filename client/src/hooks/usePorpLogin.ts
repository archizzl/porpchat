import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';
import usePorpLoginContext from './usePorpLoginContext';

/**
 * Custom hook to handle login input and submission.
 *
 * @returns username - The current value of the username input.
 * @returns handleInputChange - Function to handle changes in the input field.
 * @returns handleSubmit - Function to handle login submission
 */
const usePorpLogin = () => {
  const [username, setUsername] = useState<string>('');
  const { setPorp } = usePorpLoginContext();
  const navigate = useNavigate();

  /**
   * Function to handle the input change event.
   *
   * @param e - the event object.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  /**
   * Function to handle the form submission event.
   *
   * @param event - the form event object.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPorp({ username });
    navigate('/porpchat');
  };

  return { username, handleInputChange, handleSubmit };
};

export default usePorpLogin;
