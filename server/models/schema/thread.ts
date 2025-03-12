import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Thread collection.
 *
 * This schema defines the structure of threads used to hold private mesages and forums in the database.
 * Each message includes the following fields:
 * - `messages`: The messages in the thread
 * - `accounts`: The accounts in the thread
 * - `content`: The date the thread was most recently updated
 */
const threadSchema: Schema = new Schema(
  {
    messages: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    },
    accounts: {
      type: [{ type: String }],
    },
    threadUpdatedDateTime: {
      type: Date,
    },
  },
  { collection: 'Thread' },
);

export default threadSchema;
