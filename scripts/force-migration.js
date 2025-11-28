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

async function forceMigration() {
  try {
    console.log('🔥 FORCE MIGRATION STARTING...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Force add columns with ALTER TABLE
    console.log('📝 Adding email verification columns...');
    
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS isEmailVerified BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('✅ Added isEmailVerified');
    } catch (err) {
      console.log('⚠️ isEmailVerified may already exist');
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS emailVerificationToken VARCHAR(255) NULL
      `);
      console.log('✅ Added emailVerificationToken');
    } catch (err) {
      console.log('⚠️ emailVerificationToken may already exist');
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS emailVerificationExpires DATETIME NULL
      `);
      console.log('✅ Added emailVerificationExpires');
    } catch (err) {
      console.log('⚠️ emailVerificationExpires may already exist');
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS passwordResetToken VARCHAR(255) NULL
      `);
      console.log('✅ Added passwordResetToken');
    } catch (err) {
      console.log('⚠️ passwordResetToken may already exist');
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS passwordResetExpires DATETIME NULL
      `);
      console.log('✅ Added passwordResetExpires');
    } catch (err) {
      console.log('⚠️ passwordResetExpires may already exist');
    }
    
    // Update existing users
    await sequelize.query(`
      UPDATE users SET isEmailVerified = TRUE WHERE isEmailVerified = FALSE
    `);
    console.log('✅ Updated existing users as verified');
    
    console.log('\n🎉 FORCE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('📧 Email verification is now ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    await sequelize.close();
  }
}

forceMigration();
