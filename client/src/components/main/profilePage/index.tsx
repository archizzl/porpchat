import './index.css';
import { useNavigate } from 'react-router-dom';
import useAccountContext from '../../../hooks/useAccountContext';
import useProfile from '../../../hooks/useProfile';

/**
 * Profile Component displays the user's information, bio, and lists of questions and answers.
 */
const ProfilePage = () => {
  const { account, setAccount } = useAccountContext();
  const navigate = useNavigate();
  const {
    bio,
    isEditingBio,
    newBio,
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
  } = useProfile(account?.username);

  const handleSignOut = () => {
    setAccount(null);
    navigate('/');
    localStorage.removeItem('user');
  };

  const renderQuestionsSection = () => {
    if (loadingQuestions) {
      return <p>Loading questions...</p>;
    }
    if (errorQuestions) {
      return <p>{errorQuestions}</p>;
    }
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
    if (loadingAnswers) {
      return <p>Loading answers...</p>;
    }
    if (errorAnswers) {
      return <p>{errorAnswers}</p>;
    }
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
          <strong>Username:</strong> {account?.username || 'Guest'}
        </p>
        <p>
          <strong>Email:</strong> {account?.email || 'Not provided'}
        </p>
        <button onClick={handleSignOut} className='sign-out-button'>
          Sign Out
        </button>
      </div>

      <div className='bio-section'>
        <h3>Bio</h3>
        {isEditingBio ? (
          <div>
            <textarea
              value={newBio}
              onChange={e => setNewBio(e.target.value)}
              className='bio-textarea'
            />
            <div>
              <button onClick={handleSaveBio} className='save-bio-button'>
                Save
              </button>
              <button onClick={handleCancelEdit} className='cancel-bio-button'>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>{bio}</p>
            <button onClick={handleEditBio} className='edit-bio-button'>
              Edit Bio
            </button>
          </div>
        )}
      </div>

      <div className='profile-section'>
        <h3>Your Questions</h3>
        {renderQuestionsSection()}
      </div>

      <div className='profile-section'>
        <h3>Your Answers</h3>
        {renderAnswersSection()}
      </div>
    </div>
  );
};

export default ProfilePage;
