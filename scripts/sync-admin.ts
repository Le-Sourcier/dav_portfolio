import '../src/models/index.js';
import { connectDatabase, sequelize } from '../src/config/database.js';
import { config } from '../src/config/index.js';
import { Admin } from '../src/models/index.js';
import { logger } from '../src/utils/logger.js';

async function syncAdmin() {
  try {
    await connectDatabase();

    const [admin, created] = await Admin.findOrCreate({
      where: { email: config.admin.email },
      defaults: {
        email: config.admin.email,
        password: config.admin.password,
        name: config.owner.name || 'Yao Logan',
        role: 'super_admin',
      },
    });

    if (!created) {
      await admin.update({
        password: config.admin.password,
        name: admin.name || config.owner.name || 'Yao Logan',
        role: admin.role || 'super_admin',
      });
    }

    logger.info(`Admin ${created ? 'created' : 'updated'}: ${config.admin.email}`);
  } catch (error) {
    logger.error('Admin sync failed', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncAdmin();
