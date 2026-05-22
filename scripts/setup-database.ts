import '../src/models/index.js';
import { createDatabaseIfMissing, sequelize } from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

async function setupDatabase() {
  try {
    await createDatabaseIfMissing();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('Database setup completed: schema synchronized');
  } catch (error) {
    logger.error('Database setup failed', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
