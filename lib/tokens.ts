import crypto from 'crypto';

// Generate a random verification token
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a random password reset token
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Check if a token has expired
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

// Generate token expiry date (default: 24 hours for verification, 1 hour for password reset)
export const getTokenExpiry = (hours: number = 24): Date => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

// Generate a secure random string for various purposes
export const generateSecureRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
