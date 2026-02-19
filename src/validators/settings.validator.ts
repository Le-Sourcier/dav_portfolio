import { body } from 'express-validator';

const ALLOWED_KEYS = ['profile', 'socialLinks', 'seo', 'chatbot', 'skills', 'education'];
const MAX_VALUE_SIZE = 10000; // max JSON string length per key

export const updateSettingsValidator = [
  body()
    .isObject()
    .withMessage('Body must be an object'),
  body('*')
    .optional()
    .isObject()
    .withMessage('Each setting value must be an object'),
  // Reject unknown top-level keys
  body()
    .custom((value: Record<string, unknown>) => {
      const keys = Object.keys(value);
      const invalid = keys.filter((k) => !ALLOWED_KEYS.includes(k));
      if (invalid.length > 0) {
        throw new Error(`Unknown setting keys: ${invalid.join(', ')}. Allowed: ${ALLOWED_KEYS.join(', ')}`);
      }
      // Reject overly large values
      for (const k of keys) {
        if (JSON.stringify(value[k]).length > MAX_VALUE_SIZE) {
          throw new Error(`Setting '${k}' exceeds maximum size`);
        }
      }
      return true;
    }),
];
