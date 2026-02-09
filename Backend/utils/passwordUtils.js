import crypto from 'crypto';

/**
 * Generates a random password of specified length
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Random password
 */
export const generateRandomPassword = (length = 12) => {
  // varied characters for better security
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};
