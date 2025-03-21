import { ObjectId } from 'mongodb';
import { QueryOptions } from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Account,
  AccountResponse,
  Answer,
  AnswerResponse,
  Comment,
  CommentResponse,
  OrderType,
  Question,
  QuestionResponse,
  Tag,
  Thread,
  ThreadResponse,
  Message,
  MessageResponse,
  Forum,
  ForumResponse,
} from '../types';
import AnswerModel from './answers';
import QuestionModel from './questions';
import TagModel from './tags';
import CommentModel from './comments';
import ThreadModel from './threads';
import MessageModel from './messages';
import ForumModel from './forums';
import AccountModel from './accounts';

/**
 * Parses tags from a search string.
 *
 * @param {string} search - Search string containing tags in square brackets (e.g., "[tag1][tag2]")
 *
 * @returns {string[]} - An array of tags found in the search string
 */
const parseTags = (search: string): string[] =>
  (search.match(/\[([^\]]+)\]/g) || []).map(word => word.slice(1, -1));

/**
 * Parses keywords from a search string by removing tags and extracting individual words.
 *
 * @param {string} search - The search string containing keywords and possibly tags
 *
 * @returns {string[]} - An array of keywords found in the search string
 */
const parseKeyword = (search: string): string[] =>
  search.replace(/\[([^\]]+)\]/g, ' ').match(/\b\w+\b/g) || [];

/**
 * Checks if given question contains any tags from the given list.
 *
 * @param {Question} q - The question to check
 * @param {string[]} taglist - The list of tags to check for
 *
 * @returns {boolean} - `true` if any tag is present in the question, `false` otherwise
 */
const checkTagInQuestion = (q: Question, taglist: string[]): boolean => {
  for (const tagname of taglist) {
    for (const tag of q.tags) {
      if (tagname === tag.name) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Checks if any keywords in the provided list exist in a given question's title or text.
 *
 * @param {Question} q - The question to check
 * @param {string[]} keywordlist - The list of keywords to check for
 *
 * @returns {boolean} - `true` if any keyword is present, `false` otherwise.
 */
const checkKeywordInQuestion = (q: Question, keywordlist: string[]): boolean => {
  for (const w of keywordlist) {
    if (q.title.includes(w) || q.text.includes(w)) {
      return true;
    }
  }

  return false;
};

/**
 * Gets the newest questions from a list, sorted by the asking date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to sort
 *
 * @returns {Question[]} - The sorted list of questions
 */
const sortQuestionsByNewest = (qlist: Question[]): Question[] =>
  qlist.sort((a, b) => {
    if (a.askDateTime > b.askDateTime) {
      return -1;
    }

    if (a.askDateTime < b.askDateTime) {
      return 1;
    }

    return 0;
  });

/**
 * Gets unanswered questions from a list, sorted by the asking date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to filter and sort
 *
 * @returns {Question[]} - The filtered and sorted list of unanswered questions
 */
const sortQuestionsByUnanswered = (qlist: Question[]): Question[] =>
  sortQuestionsByNewest(qlist).filter(q => q.answers.length === 0);

/**
 * Records the most recent answer time for a question.
 *
 * @param {Question} question - The question to check
 * @param {Map<string, Date>} mp - A map of the most recent answer time for each question
 */
const getMostRecentAnswerTime = (question: Question, mp: Map<string, Date>): void => {
  // This is a private function and we can assume that the answers field is not undefined or an array of ObjectId
  const answers = question.answers as Answer[];
  answers.forEach((answer: Answer) => {
    if (question._id !== undefined) {
      const currentMostRecent = mp.get(question?._id.toString());
      if (!currentMostRecent || currentMostRecent < answer.ansDateTime) {
        mp.set(question._id.toString(), answer.ansDateTime);
      }
    }
  });
};

/**
 * Gets active questions from a list, sorted by the most recent answer date in descending order.
 *
 * @param {Question[]} qlist - The list of questions to filter and sort
 *
 * @returns {Question[]} - The filtered and sorted list of active questions
 */
const sortQuestionsByActive = (qlist: Question[]): Question[] => {
  const mp = new Map();
  qlist.forEach(q => {
    getMostRecentAnswerTime(q, mp);
  });

  return sortQuestionsByNewest(qlist).sort((a, b) => {
    const adate = mp.get(a._id?.toString());
    const bdate = mp.get(b._id?.toString());
    if (!adate) {
      return 1;
    }
    if (!bdate) {
      return -1;
    }
    if (adate > bdate) {
      return -1;
    }
    if (adate < bdate) {
      return 1;
    }
    return 0;
  });
};

/**
 * Sorts a list of questions by the number of views in descending order. First, the questions are
 * sorted by creation date (newest first), then by number of views, from highest to lowest.
 * If questions have the same number of views, the newer question will be before the older question.
 *
 * @param qlist The array of Question objects to be sorted.
 *
 * @returns A new array of Question objects sorted by the number of views.
 */
const sortQuestionsByMostViews = (qlist: Question[]): Question[] =>
  sortQuestionsByNewest(qlist).sort((a, b) => b.views.length - a.views.length);

/**
 * Adds a tag to the database if it does not already exist.
 *
 * @param {Tag} tag - The tag to add
 *
 * @returns {Promise<Tag | null>} - The added or existing tag, or `null` if an error occurred
 */
export const addTag = async (tag: Tag): Promise<Tag | null> => {
  try {
    // Check if a tag with the given name already exists
    const existingTag = await TagModel.findOne({ name: tag.name });

    if (existingTag) {
      return existingTag as Tag;
    }

    // If the tag does not exist, create a new one
    const newTag = new TagModel(tag);
    const savedTag = await newTag.save();

    return savedTag as Tag;
  } catch (error) {
    return null;
  }
};

const sortThreadsByDateTime = (tlist: Thread[]): Thread[] => {
  tlist = tlist.sort((a: Thread, b: Thread) =>
    new Date(a.threadUpdatedDateTime) > new Date(b.threadUpdatedDateTime) ? -1 : 1,
  );
  return tlist;
};

export const getAllForums = async (): Promise<Forum[]> => {
  try {
    let flist = [];
    flist = await ForumModel.find();
    return flist;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves threads from the database for a given account (identified by username)
 *
 * @param username The username of the account for which to retrieve threads.
 * @returns {Promise<Thread[]>} - Promise that resolves to a list of threads associated with the account
 */
export const getThreadsFromUser = async (username: string): Promise<Thread[] | null> => {
  try {
    // Find the account by its username
    const account = await AccountModel.findOne({ username }).populate({
      path: 'threads',
      model: 'Thread',
      populate: {
        path: 'messages',
        model: 'Message',
      },
    });

    if (!account) {
      throw new Error('Provided user does not exist');
    }

    return sortThreadsByDateTime(account.threads as Thread[]) || [];
  } catch (error) {
    return null;
  }
};

/**
 * Updates the threadUpdatedDateTime property of the thread with the given ID
 * to the current datetime and returns the updated thread.
 *
 * @param tid The ID of the thread to update.
 * @returns {Promise<ThreadResponse>} A promise that resolves to the updated thread or an error.
 */
export const updateThreadTime = async (tid: string): Promise<ThreadResponse> => {
  try {
    if (!tid) {
      throw new Error('Thread ID is required.');
    }

    // Update the thread's threadUpdatedDateTime to the current date/time
    const updatedThread = await ThreadModel.findByIdAndUpdate(
      tid,
      { threadUpdatedDateTime: new Date() },
      { new: true }, // Return the updated document
    ).populate({
      path: 'messages',
      model: 'Message',
    });

    if (!updatedThread) {
      throw new Error(`Thread with ID ${tid} not found.`);
    }

    return updatedThread;
  } catch (error) {
    return { error: `Error updating threadUpdatedDateTime: ${(error as Error).message}` };
  }
};

/**
 * Retrieves questions from the database, ordered by the specified criteria.
 *
 * @param {OrderType} order - The order type to filter the questions
 *
 * @returns {Promise<Question[]>} - Promise that resolves to a list of ordered questions
 */
export const getQuestionsByOrder = async (order: OrderType): Promise<Question[]> => {
  try {
    let qlist = [];
    if (order === 'active') {
      qlist = await QuestionModel.find().populate([
        { path: 'tags', model: TagModel },
        { path: 'answers', model: AnswerModel },
      ]);
      return sortQuestionsByActive(qlist);
    }
    qlist = await QuestionModel.find().populate([{ path: 'tags', model: TagModel }]);
    if (order === 'unanswered') {
      return sortQuestionsByUnanswered(qlist);
    }
    if (order === 'newest') {
      return sortQuestionsByNewest(qlist);
    }
    return sortQuestionsByMostViews(qlist);
  } catch (error) {
    return [];
  }
};

/**
 * Filters a list of questions by the user who asked them.
 *
 * @param qlist The array of Question objects to be filtered.
 * @param askedBy The username of the user who asked the questions.
 *
 * @returns Filtered Question objects.
 */
export const filterQuestionsByAskedBy = (qlist: Question[], askedBy: string): Question[] =>
  qlist.filter(q => q.askedBy === askedBy);

/**
 * Filters questions based on a search string containing tags and/or keywords.
 *
 * @param {Question[]} qlist - The list of questions to filter
 * @param {string} search - The search string containing tags and/or keywords
 *
 * @returns {Question[]} - The filtered list of questions matching the search criteria
 */
export const filterQuestionsBySearch = (qlist: Question[], search: string): Question[] => {
  const searchTags = parseTags(search);
  const searchKeyword = parseKeyword(search);

  if (!qlist || qlist.length === 0) {
    return [];
  }
  return qlist.filter((q: Question) => {
    if (searchKeyword.length === 0 && searchTags.length === 0) {
      return true;
    }

    if (searchKeyword.length === 0) {
      return checkTagInQuestion(q, searchTags);
    }

    if (searchTags.length === 0) {
      return checkKeywordInQuestion(q, searchKeyword);
    }

    return checkKeywordInQuestion(q, searchKeyword) || checkTagInQuestion(q, searchTags);
  });
};

/**
 * Fetches and populates a question or answer document based on the provided ID and type.
 *
 * @param {string | undefined} id - The ID of the question or answer to fetch.
 * @param {'question' | 'answer'} type - Specifies whether to fetch a question or an answer.
 *
 * @returns {Promise<QuestionResponse | AnswerResponse>} - Promise that resolves to the
 *          populated question or answer, or an error message if the operation fails
 */
export const populateDocument = async (
  id: string | undefined,
  type: 'question' | 'answer',
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!id) {
      throw new Error('Provided question ID is undefined.');
    }

    let result = null;

    if (type === 'question') {
      result = await QuestionModel.findOne({ _id: id }).populate([
        {
          path: 'tags',
          model: TagModel,
        },
        {
          path: 'answers',
          model: AnswerModel,
          populate: { path: 'comments', model: CommentModel },
        },
        { path: 'comments', model: CommentModel },
      ]);
    } else if (type === 'answer') {
      result = await AnswerModel.findOne({ _id: id }).populate([
        { path: 'comments', model: CommentModel },
      ]);
    }
    if (!result) {
      throw new Error(`Failed to fetch and populate a ${type}`);
    }
    return result;
  } catch (error) {
    return { error: `Error when fetching and populating a document: ${(error as Error).message}` };
  }
};

export const populateThread = async (id: string | undefined): Promise<ThreadResponse> => {
  try {
    if (!id) {
      throw new Error('Provided thread ID is undefined.');
    }

    let result = null;

    result = await ThreadModel.findOne({ _id: id }).populate([
      {
        path: 'messages',
        model: MessageModel,
      },
    ]);
    if (!result) {
      throw new Error(`Failed to fetch and populate a thread`);
    }
    return result;
  } catch (error) {
    return { error: `Error when fetching and populating a thread: ${(error as Error).message}` };
  }
};

/**
 * Fetches a question by its ID and increments its view count.
 *
 * @param {string} qid - The ID of the question to fetch.
 * @param {string} username - The username of the user requesting the question.
 *
 * @returns {Promise<QuestionResponse | null>} - Promise that resolves to the fetched question
 *          with incremented views, null if the question is not found, or an error message.
 */
export const fetchAndIncrementQuestionViewsById = async (
  qid: string,
  username: string,
): Promise<QuestionResponse | null> => {
  try {
    const q = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $addToSet: { views: username } },
      { new: true },
    ).populate([
      {
        path: 'tags',
        model: TagModel,
      },
      {
        path: 'answers',
        model: AnswerModel,
        populate: { path: 'comments', model: CommentModel },
      },
      { path: 'comments', model: CommentModel },
    ]);
    return q;
  } catch (error) {
    return { error: 'Error when fetching and updating a question' };
  }
};

export const markMessageReadById = async (mid: string, username: string): Promise<void> => {
  // Add the username to the views of the most recent message
  await MessageModel.findOneAndUpdate(
    { _id: new ObjectId(mid) },
    { $addToSet: { views: username } },
    { new: true },
  );
};

export const fetchAndMarkThreadReadById = async (
  tid: string,
  username: string,
): Promise<ThreadResponse | null> => {
  try {
    // Find the thread by ID
    const thread = await ThreadModel.findOne({ _id: new ObjectId(tid) }).populate({
      path: 'messages',
      model: MessageModel,
      options: { sort: { messageDateTime: -1 } },
    });

    if (!thread) {
      return null; // Thread not found
    }

    // If there are no messages, return the thread as-is
    if (!thread.messages || thread.messages.length === 0) {
      return thread;
    }

    // Get the most recent message
    const mostRecentMessage = thread.messages[0];

    // Add the username to the views of the most recent message
    await MessageModel.findOneAndUpdate(
      { _id: new ObjectId(mostRecentMessage._id) },
      { $addToSet: { views: username } },
      { new: true },
    );
    const t = await ThreadModel.findOne({ _id: new ObjectId(tid) }).populate({
      path: 'messages',
      model: MessageModel,
      options: { sort: { messageDateTime: 1 } },
    });
    return t;
  } catch (error) {
    return null;
  }
};

/**
 * Saves a new question to the database.
 *
 * @param {Question} question - The question to save
 *
 * @returns {Promise<QuestionResponse>} - The saved question, or error message
 */
export const saveQuestion = async (question: Question): Promise<QuestionResponse> => {
  try {
    const result = await QuestionModel.create(question);
    return result;
  } catch (error) {
    return { error: 'Error when saving a question' };
  }
};

/**
 * Saves a new answer to the database.
 *
 * @param {Answer} answer - The answer to save
 *
 * @returns {Promise<AnswerResponse>} - The saved answer, or an error message if the save failed
 */
export const saveAnswer = async (answer: Answer): Promise<AnswerResponse> => {
  try {
    const result = await AnswerModel.create(answer);
    return result;
  } catch (error) {
    return { error: 'Error when saving an answer' };
  }
};

/**
 * Saves a new comment to the database.
 *
 * @param {Comment} comment - The comment to save
 *
 * @returns {Promise<CommentResponse>} - The saved comment, or an error message if the save failed
 */
export const saveComment = async (comment: Comment): Promise<CommentResponse> => {
  try {
    const result = await CommentModel.create(comment);
    return result;
  } catch (error) {
    return { error: 'Error when saving a comment' };
  }
};

/**
 * Saves a new message to the database.
 *
 * @param {Message} message - The message to save
 *
 * @returns {Promise<MessageResponse>} - The saved message, or an error message if the save failed
 */
export const saveMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const result = await MessageModel.create(message);
    return result;
  } catch (error) {
    return { error: 'Error when saving a message' };
  }
};

/**
 * Saves a new thread to the database.
 *
 * @param {Thread} thread - The thread to save
 *
 * @returns {Promise<ThreadResponse>} - The saved thread, or an error message if the save failed
 */
export const saveThread = async (thread: Thread): Promise<ThreadResponse> => {
  try {
    const result = await ThreadModel.create(thread);
    return result;
  } catch (error) {
    return { error: 'Error when saving a thread' };
  }
};

/**
 * Adds a new thread to the users it's involved with.
 *
 * @param {Thread} thread - The thread to save
 *
 * @returns {Promise<ThreadResponse>} - The saved thread, or an error message if the save failed
 */
export const addThreadToAccounts = async (thread: Thread): Promise<ThreadResponse> => {
  try {
    // Update accounts with the thread's ID
    const updateAccounts = await AccountModel.updateMany(
      { username: { $in: thread.accounts } },
      { $push: { threads: thread._id } },
    );

    // Check if all accounts were updated
    if (updateAccounts.matchedCount !== thread.accounts.length) {
      throw new Error('Some accounts could not be updated with the thread');
    }

    return thread;
  } catch (error) {
    return { error: `Error when saving a thread: ${(error as Error).message}` };
  }
};

/**
 * Saves a new forum to the database.
 *
 * @param {Forum} forum - The forum to save
 *
 * @returns {Promise<ForumResponse>} - The saved forum, or an error message if the save failed
 */
export const saveForum = async (forum: Forum): Promise<ForumResponse> => {
  try {
    const result = await ForumModel.create(forum);
    return result;
  } catch (error) {
    return { error: 'Error when saving a forum' };
  }
};

/**
 * Processes a list of tags by removing duplicates, checking for existing tags in the database,
 * and adding non-existing tags. Returns an array of the existing or newly added tags.
 * If an error occurs during the process, it is logged, and an empty array is returned.
 *
 * @param tags The array of Tag objects to be processed.
 *
 * @returns A Promise that resolves to an array of Tag objects.
 */
export const processTags = async (tags: Tag[]): Promise<Tag[]> => {
  try {
    // Extract unique tag names from the provided tags array using a Set to eliminate duplicates
    const uniqueTagNamesSet = new Set(tags.map(tag => tag.name));

    // Create an array of unique Tag objects by matching tag names
    const uniqueTags = [...uniqueTagNamesSet].map(
      name => tags.find(tag => tag.name === name)!, // The '!' ensures the Tag is found, assuming no undefined values
    );

    // Use Promise.all to asynchronously process each unique tag.
    const processedTags = await Promise.all(
      uniqueTags.map(async tag => {
        const existingTag = await TagModel.findOne({ name: tag.name });

        if (existingTag) {
          return existingTag; // If tag exists, return it as part of the processed tags
        }

        const addedTag = await addTag(tag);
        if (addedTag) {
          return addedTag; // If the tag does not exist, attempt to add it to the database
        }

        // Throwing an error if addTag fails
        throw new Error(`Error while adding tag: ${tag.name}`);
      }),
    );

    return processedTags;
  } catch (error: unknown) {
    return [];
  }
};

/**
 * Adds a username to the views array of a message.
 *
 * @param mid The ID of the message to add a view to.
 * @param username The username of the user who viewed the message.
 *
 * @returns A Promise that resolves to an object containing either a success message or an error message,
 *          along with the updated views array.
 */
export const addViewToMessage = async (
  mid: string,
  username: string,
): Promise<{ msg: string; views: string[] } | { error: string }> => {
  try {
    // Check if the message exists and update the views array
    const result = await MessageModel.findOneAndUpdate(
      { _id: mid },
      {
        $addToSet: { views: username }, // Adds the username only if it's not already in the array
      },
      { new: true }, // Return the updated document
    );

    if (!result) {
      return { error: 'Message not found!' };
    }

    return {
      msg: 'View added successfully',
      views: result.views || [],
    };
  } catch (err) {
    return {
      error: 'Error when adding view to message',
    };
  }
};

/**
 * Adds a vote to a question.
 *
 * @param qid The ID of the question to add a vote to.
 * @param username The username of the user who voted.
 * @param type The type of vote to add, either 'upvote' or 'downvote'.
 *
 * @returns A Promise that resolves to an object containing either a success message or an error message,
 *          along with the updated upVotes and downVotes arrays.
 */
export const addVoteToQuestion = async (
  qid: string,
  username: string,
  type: 'upvote' | 'downvote',
): Promise<{ msg: string; upVotes: string[]; downVotes: string[] } | { error: string }> => {
  let updateOperation: QueryOptions;

  if (type === 'upvote') {
    updateOperation = [
      {
        $set: {
          upVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
              { $concatArrays: ['$upVotes', [username]] },
            ],
          },
          downVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              '$downVotes',
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
            ],
          },
        },
      },
    ];
  } else {
    updateOperation = [
      {
        $set: {
          downVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
              { $concatArrays: ['$downVotes', [username]] },
            ],
          },
          upVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              '$upVotes',
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
            ],
          },
        },
      },
    ];
  }

  try {
    const result = await QuestionModel.findOneAndUpdate({ _id: qid }, updateOperation, {
      new: true,
    });

    if (!result) {
      return { error: 'Question not found!' };
    }

    let msg = '';

    if (type === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Question upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Question downvoted successfully'
        : 'Downvote cancelled successfully';
    }

    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        type === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};

/**
 * Adds a like to a message.
 *
 * @param msgId The ID of the message to add a like to.
 * @param username The username of the user who liked the message.
 *
 * @returns A Promise that resolves to an object containing either a success message or an error message,
 *          along with the updated likes array.
 */
export const addLikeToMessage = async (
  mid: string,
  username: string,
): Promise<{ msg: string; likes: string[] } | { error: string }> => {
  try {
    // Check if the message exists and update the likes array
    const result = await MessageModel.findOneAndUpdate(
      { _id: mid },
      {
        $set: {
          likes: {
            $cond: [
              { $in: [username, '$likes'] },
              { $filter: { input: '$likes', as: 'l', cond: { $ne: ['$$l', username] } } },
              { $concatArrays: ['$likes', [username]] },
            ],
          },
        },
      },
      { new: true },
    );

    if (!result) {
      return { error: 'Message not found!' };
    }

    let msg = '';

    // Check if the like was successfully added or removed
    msg = result.likes.includes(username)
      ? 'Message liked successfully'
      : 'Like removed successfully';

    return {
      msg,
      likes: result.likes || [],
    };
  } catch (err) {
    return {
      error: 'Error when adding like to message',
    };
  }
};

/**
 * Adds an answer to a question.
 *
 * @param {string} qid - The ID of the question to add an answer to
 * @param {Answer} ans - The answer to add
 *
 * @returns Promise<QuestionResponse> - The updated question or an error message
 */
export const addAnswerToQuestion = async (qid: string, ans: Answer): Promise<QuestionResponse> => {
  try {
    if (!ans || !ans.text || !ans.ansBy || !ans.ansDateTime) {
      throw new Error('Invalid answer');
    }
    const result = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [ans._id], $position: 0 } } },
      { new: true },
    );
    if (result === null) {
      throw new Error('Error when adding answer to question');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding answer to question' };
  }
};

/**
 * Adds a message to a thread.
 *
 * @param {string} tid - The ID of the thread to add a message to
 * @param {Message} msg - The message to add
 *
 * @returns Promise<ThreadResponse> - The updated thread or an error message
 */
export const addMessageToThread = async (tid: string, msg: Message): Promise<ThreadResponse> => {
  try {
    if (!msg || !msg.content || !msg.sender || !msg.messageDateTime) {
      throw new Error('Invalid message');
    }
    const result = await ThreadModel.findOneAndUpdate(
      { _id: tid },
      {
        $push: { messages: { $each: [msg._id], $position: 0, $slice: 300 } },
      },
      { new: true },
    );
    if (result === null) {
      throw new Error('Error when adding message');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding message' };
  }
};

/**
 * Adds a comment to a question or answer.
 *
 * @param id The ID of the question or answer to add a comment to
 * @param type The type of the comment, either 'question' or 'answer'
 * @param comment The comment to add
 *
 * @returns A Promise that resolves to the updated question or answer, or an error message if the operation fails
 */
export const addComment = async (
  id: string,
  type: 'question' | 'answer',
  comment: Comment,
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!comment || !comment.text || !comment.commentBy || !comment.commentDateTime) {
      throw new Error('Invalid comment');
    }
    let result: QuestionResponse | AnswerResponse | null;
    if (type === 'question') {
      result = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else {
      result = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    }
    if (result === null) {
      throw new Error('Failed to add comment');
    }
    return result;
  } catch (error) {
    return { error: `Error when adding comment: ${(error as Error).message}` };
  }
};

/**
 * Gets a map of tags and their corresponding question counts.
 *
 * @returns {Promise<Map<string, number> | null | { error: string }>} - A map of tags to their
 *          counts, `null` if there are no tags in the database, or the error message.
 */
export const getTagCountMap = async (): Promise<Map<string, number> | null | { error: string }> => {
  try {
    const tlist = await TagModel.find();
    const qlist = await QuestionModel.find().populate({
      path: 'tags',
      model: TagModel,
    });

    if (!tlist || tlist.length === 0) {
      return null;
    }

    const tmap = new Map(tlist.map(t => [t.name, 0]));

    if (qlist != null && qlist !== undefined && qlist.length > 0) {
      qlist.forEach(q => {
        q.tags.forEach(t => {
          tmap.set(t.name, (tmap.get(t.name) || 0) + 1);
        });
      });
    }

    return tmap;
  } catch (error) {
    return { error: 'Error when construction tag map' };
  }
};

/**
 * Saves a new comment to the database.
 *
 * @param {Comment} account - The comment to save
 *
 * @returns {Promise<CommentResponse>} - The saved comment, or an error message if the save failed
 */
export const saveAccount = async (account: Account): Promise<AccountResponse> => {
  try {
    // Check if this is an SSO account
    if (!account.password) {
      account.password = '';
    }

    const result = await AccountModel.create(account);
    return result;
  } catch (error) {
    return { error: 'Error when saving an account' };
  }
};
