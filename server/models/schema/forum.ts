import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Forum collection.
 *
 * This schema defines the structure of forums, which are general topic wrappers that store questions and tags.
 * Each forum includes the following fields:
 * = name - the title of the forum
 * = description - the description of the forum
 * = thread - the group thread of the forum
 * = questions - the questions associated with this forum
 * = tags - the tags associated with this forum
 */
const forumSchema: Schema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    thread: {
      type: String,
    },
  },
  { collection: 'Forum' },
);

export default forumSchema;
