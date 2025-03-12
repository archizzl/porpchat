import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Message collection.
 *
 * This schema defines the structure of messages used for private mesages and forums in the database.
 * Each message includes the following fields:
 * - `sender`: The sender of the message
 * - `messageDateTime`: The date and time when the message was sent.
 * - `content`: The content of the message.
 */
const messageSchema: Schema = new Schema(
  {
    sender: {
      type: String,
    },
    messageDateTime: {
      type: Date,
    },
    content: {
      type: String,
    },
    likes: {
      type: [{ type: String }],
    },
    views: {
      type: [{ type: String }],
    },
  },
  { collection: 'Message' },
);

export default messageSchema;
