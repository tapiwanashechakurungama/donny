const { Sequelize, DataTypes } = require('sequelize');

// Use the same database configuration as your app
const sequelize = new Sequelize(
  "bsllvo3idsz7i88ixnas",
  "u4dq6ddsjahf6dew", 
  "Ev4HOtygXLATcuOD25zx",
  {
    host: "bsllvo3idsz7i88ixnas-mysql.services.clever-cloud.com",
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: console.log,
  }
);

async function ultraForceMigration() {
  try {
    console.log('🚀 ULTRA FORCE MIGRATION STARTING...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // First, let's check what columns exist
    console.log('🔍 Checking current table structure...');
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('Current columns:', results.map(row => row.Field));
    
    // Force add each column individually
    const columns = [
      {
        name: 'isEmailVerified',
        sql: 'ADD COLUMN isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE'
      },
      {
        name: 'emailVerificationToken', 
        sql: 'ADD COLUMN emailVerificationToken VARCHAR(255) NULL'
      },
      {
        name: 'emailVerificationExpires',
        sql: 'ADD COLUMN emailVerificationExpires DATETIME NULL'
      },
      {
        name: 'passwordResetToken',
        sql: 'ADD COLUMN passwordResetToken VARCHAR(255) NULL'
      },
      {
        name: 'passwordResetExpires',
        sql: 'ADD COLUMN passwordResetExpires DATETIME NULL'
      }
    ];
    
    for (const column of columns) {
      try {
        console.log(`📝 Adding ${column.name}...`);
        await sequelize.query(`ALTER TABLE users ${column.sql}`);
        console.log(`✅ Added ${column.name}`);
      } catch (err) {
        if (err.message.includes('Duplicate column name')) {
          console.log(`⚠️ ${column.name} already exists`);
        } else {
          console.log(`❌ Failed to add ${column.name}:`, err.message);
        }
      }
    }
    
    // Check final structure
    console.log('🔍 Final table structure check...');
    const [finalResults] = await sequelize.query('DESCRIBE users');
    console.log('Final columns:', finalResults.map(row => row.Field));
    
    // Update existing users only if column exists
    const hasEmailVerified = finalResults.some(row => row.Field === 'isEmailVerified');
    if (hasEmailVerified) {
      try {
        await sequelize.query('UPDATE users SET isEmailVerified = TRUE');
        console.log('✅ Updated existing users as verified');
      } catch (err) {
        console.log('⚠️ Could not update existing users:', err.message);
      }
    }
    
    console.log('\n🎉 ULTRA FORCE MIGRATION COMPLETED!');
    console.log('📧 Email verification should now be ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

ultraForceMigration();
