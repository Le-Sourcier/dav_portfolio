import { connectDatabase } from "../src/config/database.js";
import { BlogPost } from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";

const args = process.argv.slice(2);
const MIN = parseInt(args[0] || "10", 10);
const MAX = parseInt(args[1] || "500", 10);
const RECENT_MAX = parseInt(args[2] || "60", 10);

if (isNaN(MIN) || isNaN(MAX) || isNaN(RECENT_MAX) || MIN < 0 || MAX < MIN || RECENT_MAX < MIN) {
  console.error("Usage: npx tsx scripts/set-view-counts.ts [min] [max_old] [max_recent]");
  console.error("  min         - minimum view count floor (default: 10)");
  console.error("  max_old     - max range for oldest articles (default: 500)");
  console.error("  max_recent  - max range for newest articles (default: 60)");
  process.exit(1);
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  try {
    logger.info(`Setting view counts (min=${MIN}, max_old=${MAX}, max_recent=${RECENT_MAX})...`);
    await connectDatabase();

    const posts = await BlogPost.findAll({ order: [["createdAt", "ASC"]] });
    const oldest = posts[0]?.get("createdAt") as Date | undefined;
    const newest = posts[posts.length - 1]?.get("createdAt") as Date | undefined;
    const ageRange = oldest && newest ? newest.getTime() - oldest.getTime() : 1;

    let updated = 0;

    for (const post of posts) {
      const current = post.get("viewCount") as number;
      const createdAt = post.get("createdAt") as Date;

      if (current >= MIN) continue;

      const ratio = ageRange > 0 ? (createdAt.getTime() - oldest!.getTime()) / ageRange : 0.5;
      const postMax = Math.round(RECENT_MAX + (MAX - RECENT_MAX) * (1 - ratio));
      const views = randomInRange(MIN, Math.max(postMax, MIN));

      await post.update({ viewCount: views });
      logger.info(`  ${String(post.get("slug")).padEnd(40)} ${current} → ${views} (age:${(ratio * 100).toFixed(0)}%)`);
      updated++;
    }

    logger.info(`Updated ${updated} / ${posts.length} blog posts`);
    process.exit(0);
  } catch (error) {
    console.error("set-view-counts failed:", error);
    if (error && typeof error === "object" && "parent" in error) {
      console.error("Parent error:", (error as { parent: unknown }).parent);
    }
    process.exit(1);
  }
}

run();
