import express, { Request, Response } from 'express';
import QuestionModel from '../models/questions';
import AnswerModel from '../models/answers';
import AccountModel from '../models/accounts';

/**
 * Retrieves the username and bio of a specific user.
 *
 * @param req The HTTP request object containing the username of the user in query parameters.
 * @param res The HTTP response object used to send back the user's bio and username.
 */
const getUserBio = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).send('Missing username in request');
    return;
  }

  try {
    // Fetch the user account from the database by username
    const user = await AccountModel.findOne({ username }).select('username bio').exec();

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(`Error when fetching user bio: ${(err as Error).message}`);
  }
};

/**
 * Retrieves all questions asked by a specific user.
 *
 * @param req The HTTP request object containing the username of the user in query parameters.
 * @param res The HTTP response object used to send back the list of questions.
 */
const getUserQuestions = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).send('Missing username in request');
    return;
  }

  try {
    // Fetch all questions where `asked_by` matches the username
    const questions = await QuestionModel.find({ askedBy: username }).exec();

    if (!questions || questions.length === 0) {
      res.status(404).send('No questions found for this user');
      return;
    }

    res.status(200).json(questions);
  } catch (err) {
    res.status(500).send(`Error when fetching user questions: ${(err as Error).message}`);
  }
};

/**
 * Retrieves all answers provided by a specific user.
 *
 * @param req The HTTP request object containing the username of the user in query parameters.
 * @param res The HTTP response object used to send back the list of answers.
 */
const getUserAnswers = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.query;

  if (!username) {
    res.status(400).send('Missing username in request');
    return;
  }

  try {
    // Fetch all answers where `ansBy` matches the username
    const answers = await AnswerModel.find({ ansBy: username }).exec();

    if (!answers || answers.length === 0) {
      res.status(404).send('No answers found for this user');
      return;
    }

    res.status(200).json(answers);
  } catch (err) {
    res.status(500).send(`Error when fetching user answers: ${(err as Error).message}`);
  }
};

/**
 * Updates the bio of a specific user.
 *
 * @param req The HTTP request object containing the username and new bio in the body.
 * @param res The HTTP response object used to send back the status.
 */
const updateUserBio = async (req: Request, res: Response): Promise<void> => {
  const { username, bio } = req.body;

  if (!username || typeof username !== 'string') {
    res.status(400).send('Invalid or missing username');
    return;
  }

  if (!bio || typeof bio !== 'string') {
    res.status(400).send('Invalid or missing bio');
    return;
  }

  try {
    // Update the bio of the user in the database
    const updatedUser = await AccountModel.findOneAndUpdate(
      { username },
      { bio },
      { new: true }, // Return the updated document
    ).exec();

    if (!updatedUser) {
      res.status(404).send('User not found');
      return;
    }

    res.status(200).json({ message: 'Bio updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

// Create the router and define the routes
const profileController = () => {
  const router = express.Router();

  router.get('/getQuestions', getUserQuestions);
  router.get('/getAnswers', getUserAnswers);
  router.get('/getBio', getUserBio);
  router.put('/updateBio', updateUserBio);
  return router;
};

export default profileController;
