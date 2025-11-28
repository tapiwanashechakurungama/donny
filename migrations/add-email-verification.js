const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add email verification columns to users table
    await queryInterface.addColumn('users', 'isEmailVerified', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'emailVerificationToken', {
      type: DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'emailVerificationExpires', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'passwordResetToken', {
      type: DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'passwordResetExpires', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    // Update existing users to have email verified (since they registered before verification was required)
    await queryInterface.sequelize.query(
      'UPDATE users SET isEmailVerified = true WHERE isEmailVerified = false'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove email verification columns
    await queryInterface.removeColumn('users', 'isEmailVerified');
    await queryInterface.removeColumn('users', 'emailVerificationToken');
    await queryInterface.removeColumn('users', 'emailVerificationExpires');
    await queryInterface.removeColumn('users', 'passwordResetToken');
    await queryInterface.removeColumn('users', 'passwordResetExpires');
  }
};
