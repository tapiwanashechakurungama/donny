-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN emailVerificationToken VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN emailVerificationExpires DATETIME NULL;
ALTER TABLE users ADD COLUMN passwordResetToken VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN passwordResetExpires DATETIME NULL;

-- Update existing users to have email verified (since they registered before verification was required)
UPDATE users SET isEmailVerified = TRUE WHERE isEmailVerified = FALSE;
