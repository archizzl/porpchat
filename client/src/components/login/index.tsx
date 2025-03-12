import './index.css';
import { Link } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';

/**
 * Login Component contains a form that allows the user to input their username, which is then submitted
 * to the application's context through the useLoginContext hook.
 */
const Login = () => {
  const {
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
  } = useLogin();

  return (
    <div className='container'>
      <h2>Welcome to Friendship Overflow!</h2>
      <h4>Please enter your username and password.</h4>
      <form onSubmit={handleSubmit} className='form'>
        {errorMessage && <div className='error-message'>{errorMessage}</div>}
        <div className='form-group'>
          <input
            type='text'
            name='username'
            value={username}
            onChange={handleInputChange}
            placeholder='Enter your username'
            required
            className='input-text'
            id='usernameInput'
          />
        </div>
        <div className='form-group'>
          <div className='password-container'>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleInputChange}
              placeholder='Enter your password'
              required
              className='input-text'
              id='passwordInput'
              name='password'
            />
            <button type='button' onClick={togglePasswordVisibility} className='toggle-password'>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className='form-group remember-me-container'>
          <label htmlFor='rememberMeCheckbox' className='remember-me-label'>
            <input
              type='checkbox'
              id='rememberMeCheckbox'
              className='remember-me-checkbox'
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            Remember me
          </label>
        </div>
        <button type='submit' className='login-button'>
          Submit
        </button>
      </form>
      <div className='forgot-password'>
        <button onClick={() => setShowResetDialog(true)} className='forgot-password-button'>
          Forgot Password?
        </button>
      </div>
      {showResetDialog && (
        <div className='reset-dialog'>
          <h3>Reset Password</h3>
          <input
            type='email'
            placeholder='Enter your email'
            value={emailForReset}
            onChange={e => setEmailForReset(e.target.value)}
            className='input-text'
          />
          <button onClick={handleForgotPassword} className='reset-button'>
            Send Reset Email
          </button>
          <button onClick={() => setShowResetDialog(false)} className='cancel-button'>
            Cancel
          </button>
        </div>
      )}
      <div className='sso-buttons'>
        <button onClick={handleGoogleLogin} className='sso-button google-button'>
          Login with Google
        </button>
        <button onClick={handleGithubLogin} className='sso-button github-button'>
          Login with GitHub
        </button>
      </div>
      <p>
        Don&apos;t have an account?{' '}
        <Link to='/register' className='register-link'>
          Create here
        </Link>
      </p>
    </div>
  );
};

export default Login;
