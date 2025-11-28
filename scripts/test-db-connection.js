const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

console.log('🔍 Testing database connection...');

const sequelize = new Sequelize(
  "bn1cfdeunbmtwpft2rod",
  "ukdmkxlhycbhvxkz",
  "Rjlti3eC9wdTbFq0gFKT",
  {
    host: "bn1cfdeunbmtwpft2rod-mysql.services.clever-cloud.com",
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: true, // Show all SQL queries
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 2000,
      evict: 1000,
    },
    retry: {
      max: 3,
      timeout: 5000,
    },
  }
);

async function testConnection() {
  try {
    console.log('📡 Attempting to authenticate...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    console.log('📊 Testing basic query...');
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ Basic query successful:', results);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error Code:', error.parent?.code || error.code);
    console.error('Error Message:', error.message);
    console.error('Host:', error.parent?.address || 'Unknown');
    console.error('Port:', error.parent?.port || 'Unknown');
    
    if (error.parent?.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Check if database server is running');
      console.log('2. Verify hostname and port are correct');
      console.log('3. Check network connectivity');
      console.log('4. Verify database credentials');
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
