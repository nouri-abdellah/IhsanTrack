import { sequelize } from '../src/models/index.js';

async function resetDatabase() {
  try {
    // Disable foreign key checks to avoid drop errors
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Sync with force: true drops tables and recreates them
    await sequelize.sync({ force: true });
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
