import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getUserAccount,
  getUserQuestions,
  getUserAnswers,
} from '../../../../services/profileService';
import { Question, Answer } from '../../../../types';
import '../index.css';

const OtherUserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<{ username: string; bio: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [errorProfile, setErrorProfile] = useState('');
  const [errorQuestions, setErrorQuestions] = useState('');
  const [errorAnswers, setErrorAnswers] = useState('');

  useEffect(() => {
    if (username) {
      // Fetch user bio and username
      setLoadingProfile(true);
      getUserAccount(username)
        .then(data => {
          setUser({
            username: data.username,
            bio: data.bio || 'No bio provided', // Ensure bio is always a string
          });
          setErrorProfile('');
        })
        .catch(() => {
          setErrorProfile('Failed to load user profile');
        })
        .finally(() => setLoadingProfile(false));

      // Fetch user questions
      setLoadingQuestions(true);
      getUserQuestions(username)
        .then(data => {
          setQuestions(data);
          setErrorQuestions('');
        })
        .catch(error => {
          if (error.response?.status === 404) {
            setQuestions([]);
          } else {
            setErrorQuestions('Failed to fetch questions');
          }
        })
        .finally(() => setLoadingQuestions(false));

      // Fetch user answers
      setLoadingAnswers(true);
      getUserAnswers(username)
        .then(data => {
          setAnswers(data);
          setErrorAnswers('');
        })
        .catch(error => {
          if (error.response?.status === 404) {
            setAnswers([]);
          } else {
            setErrorAnswers('Failed to fetch answers');
          }
        })
        .finally(() => setLoadingAnswers(false));
    }
  }, [username]);

  if (loadingProfile) {
    return <p>Loading user profile...</p>;
  }

  if (errorProfile) {
    return <p>{errorProfile}</p>;
  }

  const renderQuestionsSection = () => {
    if (loadingQuestions) return <p>Loading questions...</p>;
    if (errorQuestions) return <p>{errorQuestions}</p>;
    if (questions.length > 0) {
      return (
        <ul>
          {questions.map(question => (
            <li key={question._id}>{question.title}</li>
          ))}
        </ul>
      );
    }
    return <p>No questions found.</p>;
  };

  const renderAnswersSection = () => {
    if (loadingAnswers) return <p>Loading answers...</p>;
    if (errorAnswers) return <p>{errorAnswers}</p>;
    if (answers.length > 0) {
      return (
        <ul>
          {answers.map(answer => (
            <li key={answer._id}>{answer.text}</li>
          ))}
        </ul>
      );
    }
    return <p>No answers found.</p>;
  };

  return (
    <div className='profile-container'>
      <h2>User Profile</h2>
      <div className='profile-info'>
        <p>
          <strong>Username:</strong> {user?.username || 'Unknown'}
        </p>
        <p>
          <strong>Bio:</strong> {user?.bio}
        </p>
      </div>

      <div className='profile-section'>
        <h3>{`${user?.username}'s Questions`}</h3>
        {renderQuestionsSection()}
      </div>

      <div className='profile-section'>
        <h3>{`${user?.username}'s Answers`}</h3>
        {renderAnswersSection()}
      </div>
    </div>
  );
};

export default OtherUserProfilePage;
