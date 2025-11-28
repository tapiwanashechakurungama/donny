const sequelize = require('./../lib/database');

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get the queryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // Add the email verification columns
    await queryInterface.addColumn('users', 'isEmailVerified', {
      type: require('sequelize').DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: require('sequelize').DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'emailVerificationExpires', {
      type: require('sequelize').DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'passwordResetToken', {
      type: require('sequelize').DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'passwordResetExpires', {
      type: require('sequelize').DataTypes.DATE,
      allowNull: true,
    });

    // Update existing users to have email verified
    await sequelize.query(
      'UPDATE users SET isEmailVerified = true WHERE isEmailVerified = false'
    );

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
