import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Thread,
  FindThreadRequest,
  FindThreadByIdRequest,
  AddThreadRequest,
  FakeSOSocket,
} from '../types';
import {
  fetchAndMarkThreadReadById,
  getThreadsFromUser,
  saveThread,
  populateThread,
  addThreadToAccounts,
} from '../models/application';

const threadController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves a list of threads that the user is a part of
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The FindThreadRequest object containing the query parameter `username`
   * @param res The HTTP response object used to send back the list of threads
   *
   * @returns A Promise that resolves to void.
   */
  const getThreads = async (req: FindThreadRequest, res: Response): Promise<void> => {
    const { username } = req.query;
    try {
      const tlist = await getThreadsFromUser(username);
      if (tlist) {
        res.json(tlist);
      } else {
        throw new Error('User not found');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching threads: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching threads`);
      }
    }
  };

  /**
   * Retrieves a thread by its unique ID, and updates the read status for that thread's messages
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The FindThreadByIdRequest object containing the thread ID as a parameter.
   * @param res The HTTP response object used to send back the thread details.
   *
   * @returns A Promise that resolves to void.
   */
  const getThreadById = async (req: FindThreadByIdRequest, res: Response): Promise<void> => {
    const { tid } = req.params;
    const { username } = req.query;

    if (!ObjectId.isValid(tid)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    if (!username) {
      res.status(400).send('Invalid username requesting thread.');
      return;
    }

    try {
      const t = await fetchAndMarkThreadReadById(tid, username as string);

      if (t && !('error' in t)) {
        socket.emit('messageViewsUpdate', t);
        res.json(t);
        return;
      }

      throw new Error('Error while fetching thread by id');
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching thread by id: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching thread by id`);
      }
    }
  };

  /**
   * Validates the thread object to ensure it contains all the necessary fields.
   *
   * @param thread The thread object to validate.
   *
   * @returns `true` if the thread is valid, otherwise `false`.
   */
  const isThreadBodyValid = (thread: Thread): boolean =>
    thread.messages !== undefined &&
    thread.accounts !== undefined &&
    thread.threadUpdatedDateTime !== undefined;

  /**
   * Adds a new thread to the database. The thread is first validated and then saved.
   *
   * @param req The AddThreadRequest object containing the thread data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addThread = async (req: AddThreadRequest, res: Response): Promise<void> => {
    // check if thread already exists between users
    if (!isThreadBodyValid(req.body)) {
      res.status(400).send('Invalid question body');
      return;
    }
    const thread: Thread = req.body;
    try {
      // get the recipient's threads.
      // if there exists a thread with our user, throw error
      // or, if user doesn't exist, throw error
      const threadExists = await getThreadsFromUser(thread.accounts[1]);
      if (threadExists) {
        for (const t of threadExists) {
          if (t.accounts.indexOf(thread.accounts[0]) > -1) {
            throw new Error('Thread already exists between users');
          }
        }
      } else {
        throw new Error('User does not exist');
      }

      const result = await saveThread(thread);
      if ('error' in result) {
        throw new Error(result.error);
      }

      await addThreadToAccounts(result);

      const populatedThread = await populateThread(result._id?.toString());

      if (populatedThread && 'error' in populatedThread) {
        throw new Error(populatedThread.error);
      }

      socket.emit('threadUpdate', populatedThread as Thread);
      res.json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when saving thread: ${err.message}`);
      } else {
        res.status(500).send(`Error when saving thread`);
      }
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router
  router.get('/getThreads', getThreads);
  router.get('/getThreadById/:tid', getThreadById);
  router.post('/addThread', addThread);

  return router;
};

export default threadController;
