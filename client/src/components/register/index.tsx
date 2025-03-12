import React, { useState } from 'react';
import './index.css';
import useRegister from '../../hooks/useRegister';

/**
 * Register Component contains a form that allows the user to create an account by entering their email, username, and password.
 */
const Register = () => {
  const { email, username, password, errorMessage, handleRegisterSubmit, handleInputChange } =
    useRegister();

  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='container'>
      <h2>Create Your Account</h2>
      {errorMessage && <div className='error-message'>{errorMessage}</div>}
      <form onSubmit={handleRegisterSubmit} className='form'>
        <div className='form-group'>
          <input
            type='email'
            name='email'
            value={email}
            onChange={handleInputChange}
            placeholder='Email'
            required
            className='input-text'
          />
        </div>
        <div className='form-group'>
          <input
            type='text'
            name='username'
            value={username}
            onChange={handleInputChange}
            placeholder='Username'
            required
            className='input-text'
          />
        </div>
        <div className='form-group password-container'>
          <input
            type={showPassword ? 'text' : 'password'}
            name='password'
            value={password}
            onChange={handleInputChange}
            placeholder='Password'
            required
            className='input-text'
          />
          <button type='button' onClick={togglePasswordVisibility} className='toggle-password'>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type='submit' className='login-button'>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Register;
