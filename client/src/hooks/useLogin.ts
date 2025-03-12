import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState, useEffect } from 'react';
import useLoginContext from './useLoginContext';
import {
  authenticateAccount,
  loginWithGoogle,
  loginWithGithub,
  sendPasswordReset,
} from '../services/accountService';

/**
 * Custom hook to handle login input and submission.
 *
 * @returns Various states and functions for managing login workflows.
 */
const useLogin = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailForReset, setEmailForReset] = useState<string>('');
  const [showResetDialog, setShowResetDialog] = useState<boolean>(false);
  const { setAccount } = useLoginContext();
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    else if (name === 'password') setPassword(value);
  };

  const handleRememberMeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleForgotPassword = async () => {
    try {
      if (!emailForReset) {
        return;
      }
      await sendPasswordReset(emailForReset);
      setShowResetDialog(false);
    } catch (error) {
      //
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();

      setAccount(user);

      navigate('/home');
    } catch (error) {
      //
    }
  };

  const handleGithubLogin = async () => {
    try {
      const user = await loginWithGithub();

      setAccount(user);
      navigate('/home');
    } catch (error) {
      //
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    try {
      const account = await authenticateAccount(username, password);

      if (rememberMe) localStorage.setItem('user', JSON.stringify(account));
      setAccount(account);
      navigate('/home');
    } catch (error) {
      setErrorMessage('Invalid username or password');
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setAccount(parsedUser);
      navigate('/home');
    }
  }, [setAccount, navigate]);

  return {
    username,
    password,
    emailForReset,
    showResetDialog,
    rememberMe,
    errorMessage,
    showPassword,
    setEmailForReset,
    setShowResetDialog,
    handleInputChange,
    handleRememberMeChange,
    togglePasswordVisibility,
    handleForgotPassword,
    handleGoogleLogin,
    handleGithubLogin,
    handleSubmit,
  };
};

export default useLogin;
