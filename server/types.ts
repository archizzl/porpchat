import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

export type FakeSOSocket = Server<ServerToClientEvents>;

/**
 * Type representing the possible ordering options for questions.
 */
export type OrderType = 'newest' | 'unanswered' | 'active' | 'mostViewed';

/**
 * Interface representing an Account document, which contains:
 * - _id - The unique identifier for the account. Optional field.
 * - username - The username for the account.
 * - email - The email associated with the account.
 * - password - Hashed password for secure storage.
 * - createdAt - The date the account was created.
 * - accessibilitySettings - The type of accessibility the user wants to add.
 */
export interface Account {
  _id?: ObjectId;
  username: string;
  email: string;
  bio?: string;
  password?: string;
  questions: Question[] | ObjectId[];
  answers: Answer[] | ObjectId[];
  createdAt: Date;
  threads: Thread[] | ObjectId[];
  accessibilitySettings?: AccessibilitySetting;
}

/**
 * Interface representing a Forum, which contains:
 * _id - the unique identifier of the forum. Optional field
 * name - the title of the forum
 * description - the description of the forum
 * thread - the group thread of the forum
 * questions - Object Ids of questions that have been asked in the forum, or the questions themselves if populated
 * tags - Object Ids of tags that have been associated with the forum, or the tags themselves if populated
 */
export interface Forum {
  _id?: ObjectId;
  name: string;
  description: string;
  thread: string;
}

/**
 * Interface extending the request body when adding an answer to a question, which contains:
 * - forum - the forum being added to the main database
 */
export interface ForumRequest extends Request {
  body: {
    forum: Forum;
  };
}

export type ForumResponse = Forum | { error: string };

/**
 * Interface representing a Message document, which contains:
 * _id - the unique identifier for the message. Optional field
 * recipient - the recipient of the message. optional field
 * sender - username of the user who sent the message
 * messageDateTime - the datetime the message was sent
 * content - the text of the message
 */
export interface Message {
  _id?: ObjectId;
  sender: string;
  messageDateTime: Date;
  content: string;
  views: string[];
  likes: string[];
}

/**
 * Interface extending the request body when adding an answer to a question, which contains:
 * - tid - the id of the thread which this message is being added to
 * - ans - The answer being added
 */
export interface MessageRequest extends Request {
  body: {
    tid: string;
    msg: Message;
  };
}

/**
 * Type representing the possible responses for a Thread-related operation.
 */
export type MessageResponse = Message | { error: string };

/**
 * Interface representing the payload for a message update event, which contains:
 * - tid - The unique identifier of the thread.
 * - answer - The updated message.
 */
export interface MessageUpdatePayload {
  result: ThreadResponse;
}

/**
 * Interface for the request body when liking a message
 * - body - The question ID and the username of the user voting.
 * - qid - The unique identifier of the message.
 */
export interface LikeMessageRequest extends Request {
  body: {
    mid: string;
  };
}

/**
 * Interface representing the payload for a message like update event, which contains:
 * - mid - The unique identifier of the message.
 * - likes - An array of usernames who liked the message.
 */
export interface LikeMessageUpdatePayload {
  mid: string;
  likes: string[];
}

/**
 * Interface representing the payload for a message view update event, which contains:
 * - mid - The unique identifier of the message.
 * - likes - An array of usernames who liked the message.
 */
export interface ViewMessageUpdatePayload {
  mid: string;
  views: string[];
}

/**
 * Interface representing a Thread document, which contains:
 * _id - the unique identifier for the thread. Optional field
 * messages - Object Ids of messages sent in the thread, or the messages themselves if populated
 * accounts - the accounts involved in the thread
 * updatedDate - the datetime this thread was most recently updated at
 */
export interface Thread {
  _id?: ObjectId;
  messages: Message[] | ObjectId[];
  accounts: string[];
  threadUpdatedDateTime: Date;
}

/**
 * Interface extending the request body when adding a thread
 * - body - the Thread being added to 
 */
export interface AddThreadRequest extends Request {
  body: Thread;
}

/**
 * Type representing the possible responses for a Thread-related operation.
 */
export type ThreadResponse = Thread | { error: string };

/**
 * Interface for the request query to find a thread using an Account, which contains:
 * - account: the account to find the threads
 */
export interface FindThreadRequest extends Request {
  query: {
    username: string;
  };
}

/**
 * Interface for the request parameters when returning a thread by its ID.
 * - qid - The unique identifier of the question.
 */
export interface FindThreadByIdRequest extends Request {
  params: {
    tid: string;
    username: string;
  };
}

/**
 * Interface extending the request body when adding an answer to a question, which contains:
 * - tid - the id of the thread which this message is being added to
 * - ans - The answer being added
 */
export interface InteractMessageRequest extends Request {
  body: {
    mid: string;
    username: string;
  };
}

/**
 * Interface representing an Answer document, which contains:
 * - _id - The unique identifier for the answer. Optional field
 * - text - The content of the answer
 * - ansBy - The username of the user who wrote the answer
 * - ansDateTime - The date and time when the answer was created
 * - comments - Object IDs of comments that have been added to the answer by users, or comments themselves if populated
 */
export interface Answer {
  _id?: ObjectId;
  text: string;
  ansBy: string;
  ansDateTime: Date;
  comments: Comment[] | ObjectId[];
}

/**
 * Interface extending the request body when adding an answer to a question, which contains:
 * - qid - The unique identifier of the question being answered
 * - ans - The answer being added
 */
export interface AnswerRequest extends Request {
  body: {
    qid: string;
    ans: Answer;
  };
}

/**
 * Type representing the possible responses for an Answer-related operation.
 */
export type AnswerResponse = Answer | { error: string };

/**
 * Interface representing the payload for an answer update event, which contains:
 * - qid - The unique identifier of the question.
 * - answer - The updated answer.
 */
export interface AnswerUpdatePayload {
  qid: string;
  answer: AnswerResponse;
}

/**
 * Interface representing a Tag document, which contains:
 * - _id - The unique identifier for the tag. Optional field.
 * - name - Name of the tag
 * - description - the description of the tag
 */
export interface Tag {
  _id?: ObjectId;
  name: string;
  description: string;
}

/**
 * Interface representing a Question document, which contains:
 * - _id - The unique identifier for the question. Optional field.
 * - title - The title of the question.
 * - text - The detailed content of the question.
 * - tags - An array of tags associated with the question.
 * - askedBy - The username of the user who asked the question.
 * - askDateTime - he date and time when the question was asked.
 * - answers - Object IDs of answers that have been added to the question by users, or answers themselves if populated.
 * - views - An array of usernames that have viewed the question.
 * - upVotes - An array of usernames that have upvoted the question.
 * - downVotes - An array of usernames that have downvoted the question.
 * - comments - Object IDs of comments that have been added to the question by users, or comments themselves if populated.
 */
export interface Question {
  _id?: ObjectId;
  title: string;
  text: string;
  tags: Tag[];
  askedBy: string;
  askDateTime: Date;
  answers: Answer[] | ObjectId[];
  views: string[];
  upVotes: string[];
  downVotes: string[];
  comments: Comment[] | ObjectId[];
}

/**
 * Type representing the possible responses for a Question-related operation.
 */
export type QuestionResponse = Question | { error: string };

/**
 * Interface for the request query to find questions using a search string, which contains:
 * - order - The order in which to sort the questions
 * - search - The search string used to find questions
 * - askedBy - The username of the user who asked the question
 */
export interface FindQuestionRequest extends Request {
  query: {
    order: OrderType;
    search: string;
    askedBy: string;
  };
}

export interface FindForumRequest extends Request {
  params: {
    username: string;
  }
}

/**
 * Interface for the request parameters when finding a question by its ID.
 * - qid - The unique identifier of the question.
 */
export interface FindQuestionByIdRequest extends Request {
  params: {
    qid: string;
  };
  query: {
    username: string;
  };
}

/**
 * Interface for the request body when adding a new question.
 * - body - The question being added.
 */
export interface AddQuestionRequest extends Request {
  body: Question;
}

export interface AddForumRequest extends Request {
  body: Forum;
}

/**
 * Interface for the request body when upvoting or downvoting a question.
 * - body - The question ID and the username of the user voting.
 *  - qid - The unique identifier of the question.
 *  - username - The username of the user voting.
 */
export interface VoteRequest extends Request {
  body: {
    qid: string;
    username: string;
  };
}

/**
 * Interface representing the payload for a vote update event, which contains:
 * - qid - The unique identifier of the question.
 * - upVotes - An array of usernames who upvoted the question.
 * - downVotes - An array of usernames who downvoted the question.
 */
export interface VoteUpdatePayload {
  qid: string;
  upVotes: string[];
  downVotes: string[];
}

/**
 * Interface representing a Comment, which contains:
 * - _id - The unique identifier for the comment. Optional field.
 * - text - The content of the comment.
 * - commentBy - The username of the user who commented.
 * - commentDateTime - The date and time when the comment was posted.
 *
 */
export interface Comment {
  _id?: ObjectId;
  text: string;
  commentBy: string;
  commentDateTime: Date;
}

/**
 * Interface extending the request body when adding a comment to a question or an answer, which contains:
 * - id - The unique identifier of the question or answer being commented on.
 * - type - The type of the comment, either 'question' or 'answer'.
 * - comment - The comment being added.
 */
export interface AddCommentRequest extends Request {
  body: {
    id: string;
    type: 'question' | 'answer';
    comment: Comment;
  };
}

/**
 * Type representing the possible responses for a Comment-related operation.
 */
export type CommentResponse = Comment | { error: string };

/**
 * Interface representing the payload for a comment update event, which contains:
 * - result - The updated question or answer.
 * - type - The type of the updated item, either 'question' or 'answer'.
 */
export interface CommentUpdatePayload {
  result: AnswerResponse | QuestionResponse | null;
  type: 'question' | 'answer';
}

/**
 * Interface representing the possible events that the server can emit to the client.
 */

// views update doesn't need a payload because it's just incrementing a number,
// it doesn't have a, well, payload.
// 

export type AccountResponse = Account | { error: string };

export interface AccountRequest extends Request {
  params: {
    _id: string;
  };
}

export interface AddAccountRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string; 
    accessibilitySettings: AccessibilitySetting;
  };
}

export interface UpdateAccountRequest extends Request {
  body: Account;
}

export interface AuthenticateRequest extends Request {
  body: {
    username: string;
    password: string;
  }
}

/**
 * Type representing the possible options for color blindness
 */
export type ColorBlindnessType = 'none' | 'redgreen' | 'blueyellow' | 'grayscale';

/**
 * Interface representing an accessibility setting, which contains:
 * - colorBlindness - The type of colorblindness an account user has. Optional field.
 * - lowVision - Indicates whether the account user has low vision needs. Optional field.
 */
export interface AccessibilitySetting {
  colorBlindness?: ColorBlindnessType;
  lowVision?: boolean;
}

/**
 * Interface representing the possible events that the server can emit to the client.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: QuestionResponse) => void;
  answerUpdate: (result: AnswerUpdatePayload) => void;
  viewsUpdate: (question: QuestionResponse) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (comment: CommentUpdatePayload) => void;
  threadUpdate: (thread: ThreadResponse) => void;
  messageUpdate: (message: MessageUpdatePayload) => void;
  messageLikeUpdate: (message: LikeMessageUpdatePayload) => void;
  messageViewsUpdate: (thread: ThreadResponse) => void;
  accountUpdate: (account: AccountResponse) => void;
  forumUpdate: (forum: ForumResponse) => void;
}
