import mongoose, { Model } from 'mongoose';
import forumSchema from './schema/forum';
import { Forum } from '../types';

/**
 * Mongoose model for the `Forum` collection.
 *
 * This model is created using the `Forum` interface and the `forumSchema`, representing the
 * `message` collection in the MongoDB database, and provides an interface for interacting with
 * the stored messages.
 *
 * @type {Model<Forum>}
 */
const ForumModel: Model<Forum> = mongoose.model<Forum>('Forum', forumSchema);

export default ForumModel;
