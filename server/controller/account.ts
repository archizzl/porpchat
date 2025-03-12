import express, { Response } from 'express';
import { Account, AddAccountRequest, FakeSOSocket } from '../types';
import { saveAccount } from '../models/application';
import AccountModel from '../models/accounts';

const accountController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isAddAccountRequestValid(req: AddAccountRequest): boolean {
    return !!req.body.username && !!req.body.email;
  }

  /**
   * Adds an account to the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addAccount = async (req: AddAccountRequest, res: Response): Promise<void> => {
    if (!isAddAccountRequestValid(req)) {
      res.status(400).send('Add account request body is invalid');
      return;
    }

    const { email, username, password } = req.body;
    try {
      const existingEmail = await AccountModel.findOne({ email });
      if (existingEmail) {
        res.status(400).send({ error: 'Email already in use' });
        return;
      }

      const existingUsername = await AccountModel.findOne({ username });
      if (existingUsername) {
        res.status(400).send({ error: 'Username already in use' });
        return;
      }

      const account: Account = {
        username,
        email,
        password,
        questions: [],
        answers: [],
        threads: [],
        createdAt: new Date(),
      };

      const accountFromDb = await saveAccount(account);

      if ('error' in accountFromDb) {
        throw new Error(accountFromDb.error as string);
      }

      socket.emit('accountUpdate', accountFromDb as Account);
      res.json(accountFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding account: ${(err as Error).message}`);
    }
  };

  const findOrCreateAccount = async (req: AddAccountRequest, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
      // Check if the account already exists
      const account = await AccountModel.findOne({ email });

      if (!account) {
        // If account doesn't exist, use addAccount to create it
        req.body.password = '';
        await addAccount(req, res);
        return;
      }

      // If the account exists, return it
      res.json(account);
    } catch (err) {
      res.status(500).send(`Error in findOrCreateAccount: ${(err as Error).message}`);
    }
  };

  const saveAccessibilitySettings = async (
    req: AddAccountRequest,
    res: Response,
  ): Promise<void> => {
    const { username, accessibilitySettings } = req.body;

    if (!username || !accessibilitySettings) {
      res.status(400).send('Invalid request: Missing username or accessibility settings');
      return;
    }

    try {
      const account = await AccountModel.findOne({ username });
      if (!account) {
        res.status(404).send('Account not found');
        return;
      }

      account.accessibilitySettings = accessibilitySettings;
      await account.save();

      res.status(200).send('Accessibility settings updated successfully');
    } catch (err) {
      res.status(500).send(`Error saving accessibility settings: ${(err as Error).message}`);
    }
  };

  const getAccessibilitySettings = async (req: AddAccountRequest, res: Response): Promise<void> => {
    const { username } = req.body;

    if (!username) {
      res.status(400).send('Invalid request: Missing username');
      return;
    }

    try {
      const account = await AccountModel.findOne({ username });
      if (!account) {
        res.status(404).send('Account not found');
        return;
      }

      res.status(200).json(account.accessibilitySettings);
    } catch (err) {
      res.status(500).send(`Error retrieving accessibility settings: ${(err as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addAccount', addAccount);
  router.post('/findOrCreateAccount', findOrCreateAccount);
  router.post('/saveAccessibilitySettings', saveAccessibilitySettings);
  router.post('/getAccessibilitySettings', getAccessibilitySettings);

  return router;
};

export default accountController;
