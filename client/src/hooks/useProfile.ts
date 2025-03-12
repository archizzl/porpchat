import { useState, useEffect } from 'react';
import {
  getUserQuestions,
  getUserAnswers,
  updateUserBio,
  getUserAccount,
} from '../services/profileService';
import { Question, Answer } from '../types';

const useProfile = (username: string | undefined) => {
  const [bio, setBio] = useState<string>('This is your bio. Tell us something about yourself!');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState<string>(bio);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);

  const [errorQuestions, setErrorQuestions] = useState('');
  const [errorAnswers, setErrorAnswers] = useState('');

  useEffect(() => {
    if (username) {
      getUserAccount(username)
        .then(user => {
          if (user && user.bio) {
            setBio(user.bio);
            setNewBio(user.bio); // Ensure newBio also gets updated
          }
        })
        .catch(error => {
          //
        });

      // Fetch questions
      getUserQuestions(username)
        .then(data => {
          setQuestions(data);
          setErrorQuestions('');
        })
        .catch(error => {
          if (error.response?.status === 404) {
            setQuestions([]);
          } else {
            setErrorQuestions(error.message || 'Failed to fetch questions');
          }
        })
        .finally(() => setLoadingQuestions(false));

      // Fetch answers
      getUserAnswers(username)
        .then(data => {
          setAnswers(data);
          setErrorAnswers('');
        })
        .catch(error => {
          if (error.response?.status === 404) {
            setAnswers([]);
          } else {
            setErrorAnswers(error.message || 'Failed to fetch answers');
          }
        })
        .finally(() => setLoadingAnswers(false));
    }
  }, [username]);

  const handleEditBio = () => {
    setIsEditingBio(true);
  };

  const handleSaveBio = async () => {
    if (!username) {
      return;
    }

    try {
      const response = await updateUserBio(username, newBio);
      if (response.user && response.user.bio) {
        setBio(response.user.bio); // Update bio locally
      }
      setIsEditingBio(false);
    } catch (error) {
      //
    }
  };

  const handleCancelEdit = () => {
    setNewBio(bio || '');
    setIsEditingBio(false);
  };

  useEffect(() => {
    if (username) {
      setNewBio(bio);
    }
  }, [bio, username]);

  return {
    bio,
    newBio,
    isEditingBio,
    setNewBio,
    handleEditBio,
    handleSaveBio,
    handleCancelEdit,
    questions,
    answers,
    loadingQuestions,
    loadingAnswers,
    errorQuestions,
    errorAnswers,
  };
};

export default useProfile;
