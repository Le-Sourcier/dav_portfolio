import { Sequelize } from 'sequelize';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging ? (msg) => logger.debug(msg) : false,
    pool: config.database.pool,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    if (config.nodeEnv === 'development' && process.env.DB_AUTO_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    const err = error as Error & { parent?: { message?: string; detail?: string; code?: string }; sql?: string };
    logger.error('Database sync/connect failed', {
      message: err.message,
      parentMessage: err.parent?.message,
      parentDetail: err.parent?.detail,
      parentCode: err.parent?.code,
      sql: err.sql,
    });
    throw error;
  }
};

export { sequelize };
export default sequelize;
