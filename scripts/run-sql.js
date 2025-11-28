const mysql = require('mysql2/promise');

// Database configuration - update these with your actual database credentials
const dbConfig = {
  host: 'localhost',
  user: 'root', // Update with your MySQL username
  password: '', // Update with your MySQL password
  database: 'community_portal' // Update with your database name
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Running migration...');
    
    // Add email verification columns
    await connection.execute(`
      ALTER TABLE users ADD COLUMN isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log('✅ Added isEmailVerified column');
    
    await connection.execute(`
      ALTER TABLE users ADD COLUMN emailVerificationToken VARCHAR(255) NULL
    `);
    console.log('✅ Added emailVerificationToken column');
    
    await connection.execute(`
      ALTER TABLE users ADD COLUMN emailVerificationExpires DATETIME NULL
    `);
    console.log('✅ Added emailVerificationExpires column');
    
    await connection.execute(`
      ALTER TABLE users ADD COLUMN passwordResetToken VARCHAR(255) NULL
    `);
    console.log('✅ Added passwordResetToken column');
    
    await connection.execute(`
      ALTER TABLE users ADD COLUMN passwordResetExpires DATETIME NULL
    `);
    console.log('✅ Added passwordResetExpires column');
    
    // Update existing users
    await connection.execute(`
      UPDATE users SET isEmailVerified = TRUE WHERE isEmailVerified = FALSE
    `);
    console.log('✅ Updated existing users as email verified');
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Columns already exist - migration not needed');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
