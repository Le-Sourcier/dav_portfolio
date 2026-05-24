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

export const createDatabaseIfMissing = async (): Promise<void> => {
  const databaseName = config.database.name;
  if (!/^[a-zA-Z0-9_-]+$/.test(databaseName)) {
    throw new Error(`Unsafe database name: ${databaseName}`);
  }

  const adminSequelize = new Sequelize(
    'postgres',
    config.database.username,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: config.database.dialect,
      logging: false,
    }
  );

  try {
    await adminSequelize.authenticate();
    const [rows] = await adminSequelize.query(
      'SELECT 1 FROM pg_database WHERE datname = :databaseName',
      { replacements: { databaseName } }
    );

    if (Array.isArray(rows) && rows.length === 0) {
      await adminSequelize.query(`CREATE DATABASE "${databaseName}"`);
      logger.info(`Database "${databaseName}" created`);
    }
  } finally {
    await adminSequelize.close();
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    if (process.env.DB_AUTO_CREATE === 'true') {
      await createDatabaseIfMissing();
    }

    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    if (process.env.DB_AUTO_SYNC === 'true') {
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
