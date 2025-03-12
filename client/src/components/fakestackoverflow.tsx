import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import PorpLayout from './porplayout';
import Login from './login';
import Register from './register';
import { FakeSOSocket, Account, Porp } from '../types';
import LoginContext from '../contexts/LoginContext';
import PorpLoginContext from '../contexts/PorpLoginContext';
import AccountContext from '../contexts/AccountContext';
import PorpContext from '../contexts/PorpContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import ProfilePage from './main/profilePage';
import ThreadsPage from './threads/threadsPage';
import NewThreadPage from './main/newThread';
import NewForumPage from './main/newForum';
import OtherUserProfilePage from './main/profilePage/otherProfile';
import AccessibilitySetting from './accessibility';
import ThreadPage from './threads/threadPage';
import PorpThreadPage from './threads/porpThreadPage';
import ForumsPage from './main/forumsPage';
import PorpLogin from './porplogin';

const PorpProtectedRoute = ({
  porp,
  socket,
  children,
}: {
  porp: Porp | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!porp || !socket) {
    return <Navigate to='/' />;
  }

  return <PorpContext.Provider value={{ porp, socket }}>{children}</PorpContext.Provider>;
};

const ProtectedRoute = ({
  account,
  socket,
  children,
  setAccount,
}: {
  account: Account | null;
  socket: FakeSOSocket | null;
  setAccount: (account: Account | null) => void;
  children: JSX.Element;
}) => {
  if (!account || !socket) {
    return <Navigate to='/' />;
  }

  return (
    <AccountContext.Provider value={{ account, socket, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [porp, setPorp] = useState<Porp | null>(null);

  useEffect(() => {
    // Apply class to the body or main container based on color blindness selection
    const colorBlindness = account?.accessibilitySettings?.colorBlindness;
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
  }, [account?.accessibilitySettings?.colorBlindness]);

  return (
    <PorpLoginContext.Provider value={{ setPorp }}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<PorpLogin />} />
        <Route path='/register' element={<Register />} />
        <Route path='/porp' element={<PorpLogin />} />

        {/* Porp Routes */}
        {
          <Route
            element={
              <PorpProtectedRoute porp={porp} socket={socket}>
                <PorpLayout />
              </PorpProtectedRoute>
            }>
            <Route path='/porpchat' element={<PorpThreadPage />} />
          </Route>
        }

        {/* Protected Routes */}
        {
          <Route
            element={
              <ProtectedRoute account={account} socket={socket} setAccount={setAccount}>
                <Layout />
              </ProtectedRoute>
            }>
            <Route path='/home' element={<QuestionPage />} />
            <Route path='/forums' element={<ForumsPage />} />
            <Route path='/tags' element={<TagPage />} />
            <Route path='/question/:qid' element={<AnswerPage />} />
            <Route path='/new/question' element={<NewQuestionPage />} />
            <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/threads' element={<ThreadsPage />} />
            <Route path='/new/thread' element={<NewThreadPage />} />
            <Route path='/profile/:username' element={<OtherUserProfilePage />} />
            <Route path='/accessibility-settings' element={<AccessibilitySetting />} />
            <Route path='/threads/:tid' element={<ThreadPage />} />
            <Route path='/new/forum' element={<NewForumPage />} />
          </Route>
        }
      </Routes>
    </PorpLoginContext.Provider>
  );
};

export default FakeStackOverflow;
