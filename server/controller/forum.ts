import express, { Response } from 'express';
import { FindForumRequest, Forum, AddForumRequest, FakeSOSocket, Thread } from '../types';
import { getAllForums, saveForum, saveThread } from '../models/application';

const forumController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves a list of forums.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The FindForumRequest object containing the query parameter `username`
   * @param res The HTTP response object used to send back the filtered list of questions.
   *
   * @returns A Promise that resolves to void.
   */
  const getForums = async (req: FindForumRequest, res: Response): Promise<void> => {
    try {
      const flist: Forum[] = await getAllForums();
      res.json(flist);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching forums: ${err.message}`);
      } else {
        res.status(500).send(`Error when fetching forums`);
      }
    }
  };

  /**
   * Adds a new forum to the database. A new thread is created and associated with the forum.
   * If the thread creation, tags validation, or saving the forum fails, the HTTP response status is updated.
   *
   * @param req The AddForumRequest object containing the forum data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addForum = async (req: AddForumRequest, res: Response): Promise<void> => {
    if (!(req.body.description && req.body.name)) {
      res.status(400).send('Invalid forum body');
      return;
    }

    const forum: Forum = req.body;

    try {
      const newThread: Thread = {
        messages: [],
        accounts: [],
        threadUpdatedDateTime: new Date(),
      };

      const threadResult = await saveThread(newThread);

      if ('error' in threadResult) {
        throw new Error(threadResult.error);
      }

      forum.thread = threadResult._id!.toString();

      const forumResult = await saveForum(forum);

      if ('error' in forumResult) {
        throw new Error(forumResult.error);
      }

      // Notify via socket and send the response
      socket.emit('forumUpdate', forumResult as Forum);
      res.json(forumResult);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when saving forum: ${err.message}`);
      } else {
        res.status(500).send(`Error when saving forum`);
      }
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router
  router.get('/getForums', getForums);
  router.post('/addForum', addForum);

  return router;
};

export default forumController;
