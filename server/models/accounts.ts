import mongoose, { Model } from 'mongoose';
import accountSchema from './schema/account';
import { Account } from '../types';

/**
 * Mongoose model for the `Account` collection.
 *
 * This model is created using the `Account` interface and the `accountSchema`, representing the
 * `Account` collection in the MongoDB database, and provides an interface for interacting with
 * the stored accounts.
 *
 * @type {Model<Account>}
 */
const AccountModel: Model<Account> = mongoose.model<Account>('Account', accountSchema);

export default AccountModel;
