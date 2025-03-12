import express, { Response } from 'express';
import { Message, MessageRequest, InteractMessageRequest, FakeSOSocket } from '../types';
import {
  addMessageToThread,
  saveMessage,
  updateThreadTime,
  addViewToMessage,
  addLikeToMessage,
} from '../models/application';

/*

all model interaction is done in application.ts

all interactions with the client are performed here.

*/

const messageController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided message request contains the required fields.
   *
   * @param req The request object containing the message data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isRequestValid(req: MessageRequest): boolean {
    return !!req.body.msg && !!req.body.tid;
  }

  /**
   * Checks if the provided answer contains the required fields.
   *
   * @param ans The answer object to validate.
   *
   * @returns `true` if the answer is valid, otherwise `false`.
   */
  function isMessageValid(msg: Message): boolean {
    return !!msg.sender && !!msg.messageDateTime && !!msg.content;
  }

  /**
   * Sends a message, creating a new thread if necessary.
   *
   * @param req - The request object containing the message details
   * @param res - The response object
   * @returns A Promise that resolves to void.
   */
  const addMessage = async (req: MessageRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    if (!isMessageValid(req.body.msg)) {
      res.status(400).send('Invalid message');
      return;
    }

    const { tid, msg } = req.body;

    try {
      const messageFromDB = await saveMessage(msg);

      if ('error' in messageFromDB) {
        throw new Error(messageFromDB.error as string);
      }

      const status = await addMessageToThread(tid, messageFromDB);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      const populatedThread = await updateThreadTime(tid);

      if (populatedThread && 'error' in populatedThread) {
        throw new Error(populatedThread.error as string);
      }

      // Populates the fields of the thread that this message
      // was added to, and emits the updated object
      socket.emit('messageUpdate', {
        result: populatedThread,
      });
      res.json(messageFromDB);
    } catch (err) {
      res.status(500).send(`Error when sending message: ${(err as Error).message}`);
    }
  };

  /**
   * Sends a message, creating a new thread if necessary.
   *
   * @param req - The request object containing the message details
   * @param res - The response object
   * @returns A Promise that resolves to void.
   */
  const readMessage = async (req: InteractMessageRequest, res: Response): Promise<void> => {
    if (!(!!req.body.mid || !!req.body.username)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { mid, username } = req.body;

    try {
      const status = await addViewToMessage(mid, username);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      res.json(status);
    } catch (err) {
      res.status(500).send(`Error when reading message: ${(err as Error).message}`);
    }
  };

  const likeMessage = async (req: InteractMessageRequest, res: Response): Promise<void> => {
    if (!(!!req.body.mid || !!req.body.username)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { mid, username } = req.body;

    try {
      const status = await addLikeToMessage(mid, username);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      res.json(status);
    } catch (err) {
      res.status(500).send(`Error when liking message: ${(err as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addMessage', addMessage);
  router.post('/readMessage', readMessage);
  router.post('/likeMessage', likeMessage);

  return router;
};

export default messageController;
