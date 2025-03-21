import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Question" page. When clicked, it redirects the user to the page
 * where they can ask a new question.
 */
const AskQuestionButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Question" page.
   */
  const handleNewQuestion = () => {
    navigate('/new/question');
  };

  return (
    <button
      className='qbtn'
      onClick={() => {
        handleNewQuestion();
      }}>
      Ask!
    </button>
  );
};

export default AskQuestionButton;
