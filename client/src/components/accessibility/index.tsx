/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import useAccountContext from '../../hooks/useAccountContext';
import api from '../../services/config';
import { AccessibilitySetting, ColorBlindnessType } from '../../types';

const ACCOUNT_API_URL = `${process.env.REACT_APP_SERVER_URL}/account`;

const Accessibility = () => {
  const [lowVision, setLowVision] = useState<boolean>(false);
  const [colorBlindness, setColorBlindness] = useState<ColorBlindnessType>('none');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { account, setAccount } = useAccountContext();
  const navigate = useNavigate();

  // Update theme based on color blindness selection
  useEffect(() => {
    if (colorBlindness === 'redgreen') {
      document.body.classList.add('theme-redgreen');
      document.body.classList.remove('theme-blueyellow', 'theme-grayscale');
    } else if (colorBlindness === 'blueyellow') {
      document.body.classList.add('theme-blueyellow');
      document.body.classList.remove('theme-redgreen', 'theme-grayscale');
    } else if (colorBlindness === 'grayscale') {
      document.body.classList.add('theme-grayscale');
      document.body.classList.remove('theme-redgreen', 'theme-blueyellow');
    } else {
      document.body.classList.remove('theme-redgreen', 'theme-blueyellow', 'theme-grayscale');
    }
  }, [colorBlindness]);

  const handleSavePreferences = async () => {
    if (!account) {
      setFeedbackMessage('Account context is null.');
      return;
    }
    const config: AccessibilitySetting = { lowVision, colorBlindness };
    account.accessibilitySettings = config;

    try {
      const response = await api.post(`${ACCOUNT_API_URL}/saveAccessibilitySettings`, account);

      if (response.status === 200) {
        setFeedbackMessage('Preferences saved successfully');
        setAccount(account);
        navigate('/home');
      } else {
        setFeedbackMessage('Failed to save preferences');
      }
    } catch (error) {
      setFeedbackMessage('An error occurred while saving preferences');
    }
  };

  return (
    <div className='container'>
      <h2>Accessibility Settings</h2>
      <form className='form'>
        {/* Low Vision Dropdown */}
        <div className='form-group'>
          <label htmlFor='lowVision'>Are you a low vision user?</label>
          <select
            id='lowVision'
            value={lowVision ? 'true' : 'false'}
            onChange={e => setLowVision(e.target.value === 'true')}
            className='input-text'
            aria-describedby='lowVision-description'
            required>
            <option value=''>Select an option</option>
            <option value='true'>Yes</option>
            <option value='false'>No</option>
          </select>
          <span id='lowVision-description' className='sr-only'>
            Select "Yes" if you have low vision; otherwise, select "No".
          </span>
        </div>

        {/* Color Blindness Dropdown */}
        <div className='form-group'>
          <label htmlFor='colorBlindness'>Which color blindness do you have?</label>
          <select
            id='colorBlindness'
            value={colorBlindness}
            onChange={e => setColorBlindness(e.target.value as ColorBlindnessType)}
            className='input-text'
            required>
            <option value='none'>None</option>
            <option value='redgreen'>Red-Green</option>
            <option value='blueyellow'>Blue-Yellow</option>
            <option value='grayscale'>Grayscale</option>
          </select>
        </div>

        {/* Low Vision User Prompt for VoiceOver */}
        {lowVision && (
          <div className='voiceover-prompt'>
            <p>
              Since you’ve selected that you are a low vision user, we recommend turning on
              <strong>VoiceOver</strong> on your macOS device for a better experience.
            </p>
            <p>
              To turn on VoiceOver:
              <ul>
                <li>
                  Press <strong>Cmd + F5</strong> to toggle VoiceOver on and off.
                </li>
                <li>
                  Or go to <strong>System Preferences, then Accessibility, then VoiceOver</strong>{' '}
                  to enable it.
                </li>
              </ul>
            </p>
          </div>
        )}

        {/* Save and Skip Buttons */}
        <button
          type='button'
          onClick={handleSavePreferences}
          className='save-preferences-button'
          aria-label='Save your accessibility preferences'>
          Save Preferences
        </button>
        <p>
          <Link to='/home' className='skip-to-home'>
            Skip for Now
          </Link>
        </p>
      </form>

      {/* Feedback Message (Aria Live Region) */}
      {feedbackMessage && (
        <div role='alert' aria-live='assertive' className='feedback-message'>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default Accessibility;
