import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Account collection.
 *
 * This schema defines the structure for storing user account information in the database.
 * Each account includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The password of the user.
 * - `email`: The email address of the user.
 * - 'accessibilitySettings': The accessibility setting the user selected.
 */

// const accountSchema = new Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: false },
//     created_at: { type: Date, default: Date.now },
//     questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
//     answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
//     threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }],
//     accessibilitySettings: [{ type: Schema.Types.ObjectId, ref: 'AccessibilitySchema' }],
//   },
//   { collection: 'Account' },
// );

// export default accountSchema;

const accountSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    bio: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }],
    accessibilitySettings: {
      lowVision: { type: Boolean, default: false },
      colorBlindness: {
        type: String,
        enum: ['none', 'redgreen', 'blueyellow', 'grayscale'],
        default: 'none',
      },
    },
  },
  { collection: 'Account' },
);

export default accountSchema;
