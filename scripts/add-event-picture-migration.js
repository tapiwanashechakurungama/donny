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

async function addEventPictureMigration() {
  try {
    console.log('🖼️ ADDING EVENT PICTURE COLUMN...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Check current table structure
    console.log('🔍 Checking current events table structure...');
    const [results] = await sequelize.query('DESCRIBE events');
    console.log('Current columns:', results.map(row => row.Field));
    
    // Add eventPicture column
    const hasEventPicture = results.some(row => row.Field === 'eventPicture');
    
    if (!hasEventPicture) {
      try {
        console.log('📝 Adding eventPicture column...');
        await sequelize.query(`
          ALTER TABLE events 
          ADD COLUMN eventPicture VARCHAR(500) NULL
        `);
        console.log('✅ Added eventPicture column');
      } catch (err) {
        console.log('❌ Failed to add eventPicture column:', err.message);
      }
    } else {
      console.log('⚠️ eventPicture column already exists');
    }
    
    // Check final structure
    console.log('🔍 Final table structure check...');
    const [finalResults] = await sequelize.query('DESCRIBE events');
    console.log('Final columns:', finalResults.map(row => row.Field));
    
    console.log('\n🎉 EVENT PICTURE MIGRATION COMPLETED!');
    console.log('📸 Events can now have pictures!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

addEventPictureMigration();
