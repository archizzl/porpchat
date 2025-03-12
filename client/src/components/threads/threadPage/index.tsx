import { useEffect, useRef } from 'react';
import { getMetaData } from '../../../tool';
import './index.css';
import useThreadPage from '../../../hooks/useThreadPage';

/**
 * MessageSection component shows the users all the message and allows the user to send more messages
 *
 * @param comments: an array of Message objects
 * @param handleAddComment: function to handle the addition of a new Message
 */
const ThreadPage = () => {
  const { thread, messages, handleAddMessageClick, message, setMessage, account } = useThreadPage();
  // Reference to the messages container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when the component renders or when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // This effect runs whenever `messages` changes

  if (messages) {
    // Helper function to determine the chatting partner(s)
    const getChattingWith = () => {
      if (thread?.accounts?.length) {
        return thread.accounts.find(username => username !== account.username) || 'unknown user';
      }
      // If `thread.accounts` is empty, extract unique usernames from messages
      const uniqueUsernames = Array.from(
        new Set(messages.map(m => m.sender).filter(username => username !== account.username)),
      );
      return uniqueUsernames.length > 0 ? uniqueUsernames.join(', ') : 'no one. . . YET!!!';
    };
    return (
      <div className='thread'>
        <ul className='thread-messages'>
          {messages.length > 0 ? (
            messages.map((m, index) => {
              // Check if the current message sender is different from the previous message
              const showMeta = index === 0 || m.sender !== messages[index - 1].sender;
              const fromMe = m.sender === account.username;
              return (
                <li key={index} className='message-item'>
                  {showMeta && (
                    <small className='message-meta'>
                      {m.sender}, {getMetaData(new Date(m.messageDateTime))}
                    </small>
                  )}
                  <p className={`message-text ${fromMe ? 'from-me' : ''}`}>{m.content}</p>
                </li>
              );
            })
          ) : (
            <p className='no-messages'>No messages yet.</p>
          )}
          <div ref={messagesEndRef} />
        </ul>
        <div className='send-message'>
          <div className='send-message-form'>
            <textarea
              placeholder='Say something nice!'
              value={message}
              onChange={e => setMessage(e.target.value)}
              className='message-textarea'
            />
            <button className='send-message-button' onClick={handleAddMessageClick}>
              Send Message!
            </button>
          </div>
          {thread && (
            <div className='stats-section'>
              <div className='stats-stats'>
                Chatting with {getChattingWith()} <br />
                {/* There have been {thread.messages.length} messages sent. */}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return <div>No messages found!</div>;
};

export default ThreadPage;
