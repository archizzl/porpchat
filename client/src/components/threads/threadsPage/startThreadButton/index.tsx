import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

/**
 * StartThreadButton component that renders a button for navigating to the
 * "New Thread" page. When clicked, it redirects the user to the page
 * where they can start a new thread
 */
const StartThreadButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Thread" page.
   */
  const handleNewThread = () => {
    navigate('/new/thread');
  };

  return (
    <button
      className='newThreadBtn'
      onClick={() => {
        handleNewThread();
      }}>
      Start a Thread
    </button>
  );
};

export default StartThreadButton;
