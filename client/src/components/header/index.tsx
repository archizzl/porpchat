import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import useAccountContext from '../../hooks/useAccountContext';
import './index.css';

/**
 * Header component that renders the main title and a profile link.
 * The profile link allows the user to go to their profile page.
 */
const Header = () => {
  const { account } = useAccountContext();

  return (
    <div id='header' className='header' role='banner'>
      {/* Profile link with aria-label for screen readers */}
      <Link to='/profile' aria-label={`Go to ${account.username}'s profile`}>
        <FaUserCircle
          className='profile-icon'
          aria-hidden='true' /* Hides the icon from screen readers, because this does not need to be read */
        />
        <div className='profile-name' role='heading' aria-level={2}>
          {account.username}
        </div>
      </Link>

      {/* Image with alt text for accessibility */}
      <img
        id='header_img'
        src='https://i.imgur.com/cyweElh.png'
        alt='Header image displaying website logo'
        role='img'
      />
    </div>
  );
};

export default Header;
