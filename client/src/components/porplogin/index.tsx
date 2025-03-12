import React from 'react';
import './index.css';
import usePorpLogin from '../../hooks/usePorpLogin';

/**
 * Login Component contains a form that allows the user to input their username, which is then submitted
 * to the application's context through the useLoginContext hook.
 */
const PorpLogin = () => {
  const { username, handleSubmit, handleInputChange } = usePorpLogin();

  return (
    <div className='porp-container'>
      <h2>Welcome to PorpChat!</h2>
      <img
        height='100'
        src='https://i0.wp.com/whalescientists.com/wp-content/uploads/2022/03/Yangtze_finless_porpoise_10_November_2006.jpeg?resize=749%2C1024&ssl=1'
      />
      <h4>Please enter your username!!</h4>
      <form onSubmit={handleSubmit} className='porploginform'>
        <input
          type='text'
          value={username}
          onChange={handleInputChange}
          placeholder='Enter your username'
          required
          className='porp-input-text'
          id={'usernameInput'}
        />
        <button type='submit' className='login-button'>
          Submit
        </button>
      </form>
    </div>
  );
};

export default PorpLogin;
