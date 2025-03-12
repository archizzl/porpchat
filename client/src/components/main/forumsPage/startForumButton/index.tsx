import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

/**
 * StartForumButton component that renders a button for navigating to the
 * "New Forum" page. When clicked, it redirects the user to the page
 * where they can start a new forum.
 */
const StartForumButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Forum" page.
   */
  const handleNewForum = () => {
    navigate('/new/forum');
  };

  return (
    <button
      className='newForumBtn'
      onClick={() => {
        handleNewForum();
      }}>
      Start a Forum
    </button>
  );
};

export default StartForumButton;
