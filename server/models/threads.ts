import mongoose, { Model } from 'mongoose';
import threadSchema from './schema/thread';
import { Thread } from '../types';

/**
 * Mongoose model for the `Thread` collection.
 *
 * This model is created using the `Thread` interface and the `threadSchema`, representing the
 * `thread` collection in the MongoDB database, and provides an interface for interacting with
 * the stored threads.
 *
 * @type {Model<Thread>}
 */
const ThreadModel: Model<Thread> = mongoose.model<Thread>('Thread', threadSchema);

export default ThreadModel;
