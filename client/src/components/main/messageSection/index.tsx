import { useState } from 'react';
import { getMetaData } from '../../../tool';
import { Message } from '../../../types';
import './index.css';
import useAccountContext from '../../../hooks/useAccountContext';

/**
 * Interface representing the props for the Message Section component.
 *
 * - messages - list of the message components
 * - handleAddMessage - a function that handles adding a new message, taking a Message object as an argument
 */
interface MessageSectionProps {
  messages: Message[];
  handleAddMessage: (message: Message) => void;
}

/**
 * MessageSection component shows the users all the message and allows the user to send more messages
 *
 * @param messages: an array of Message objects
 * @param handleAddmessage: function to handle the addition of a new Message
 */
const MessageSection = ({ messages, handleAddMessage }: MessageSectionProps) => {
  const { account } = useAccountContext();
  const [content, setContent] = useState<string>('');

  /**
   * Function to handle the addition of a new comment.
   */
  const handleAddMessageClick = () => {
    if (content.trim() === '' || account.username.trim() === '') {
      return;
    }

    const newMessage: Message = {
      content,
      sender: account.username,
      messageDateTime: new Date(),
      views: [],
      likes: [],
    };

    handleAddMessage(newMessage);
    setContent('');
  };

  return (
    <div className='comment-section'>
      <div className='comments-container'>
        <ul className='comments-list'>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <li key={index} className='comment-item'>
                <p className='comment-text'>{message.content}</p>
                <small className='comment-meta'>
                  {message.sender}, {getMetaData(new Date(message.messageDateTime))}
                </small>
              </li>
            ))
          ) : (
            <p className='no-comments'>No comments yet.</p>
          )}
        </ul>

        <div className='add-comment'>
          <div className='input-row'>
            <textarea
              placeholder='Say something nice!'
              value={content}
              onChange={e => setContent(e.target.value)}
              className='comment-textarea'
            />
            <button className='add-comment-button' onClick={handleAddMessageClick}>
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
