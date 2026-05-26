import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

type RevalidationTarget = {
  tags: string[];
};

class RevalidationService {
  private get endpoint(): string {
    return process.env.FRONTEND_REVALIDATE_URL || `${config.frontendUrl.replace(/\/+$/, '')}/api/revalidate`;
  }

  private get secret(): string | undefined {
    return process.env.REVALIDATE_SECRET;
  }

  async revalidate({ tags }: RevalidationTarget): Promise<void> {
    const cleanTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
    if (cleanTags.length === 0) return;

    if (!this.secret) {
      logger.warn(`Skipping frontend revalidation for tags "${cleanTags.join(', ')}": REVALIDATE_SECRET is missing`);
      return;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secret}`,
        },
        body: JSON.stringify({ tags: cleanTags }),
      });

      if (!response.ok) {
        logger.warn(`Frontend revalidation failed (${response.status}) for tags: ${cleanTags.join(', ')}`);
        return;
      }

      logger.info(`Frontend cache revalidated for tags: ${cleanTags.join(', ')}`);
    } catch (error) {
      logger.warn(`Frontend revalidation request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const revalidationService = new RevalidationService();
export default revalidationService;
