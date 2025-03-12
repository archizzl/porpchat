import { Schema } from 'mongoose';

/**
 * Mongoose schema for the AccessibilitySetting
 *
 * This schema defines the structure of AccessibilitySettings used to hold what the user chose for their preferences
 * An AccessibilitySettings includes the following fields:
 * - `colorblindness`: The type of color blindness a user may have.
 * - `lowVision`: Whether a user needs accomodation for low vision or not.
 */
const accessibilitySettingSchema: Schema = new Schema(
  {
    colorBlindness: {
      type: String,
      enum: ['none', 'redgreen', 'blueyellow', 'grayscale'],
      default: 'none',
    },
    lowVision: {
      type: Boolean,
      default: false,
    },
  },
  { collection: 'AccessibilitySetting' },
);

export default accessibilitySettingSchema;
