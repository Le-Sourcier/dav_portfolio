import { connectDatabase } from "../src/config/database.js";
import { BlogPost } from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";

const MIN_VIEWS = 10;
const MAX_VIEWS = 350;

function randomViews(): number {
  return Math.floor(Math.random() * (MAX_VIEWS - MIN_VIEWS + 1)) + MIN_VIEWS;
}

async function run() {
  try {
    logger.info("Setting minimum view counts for blog posts...");
    await connectDatabase();

    const posts = await BlogPost.findAll();
    let updated = 0;

    for (const post of posts) {
      const current = post.get("viewCount") as number;
      if (current < MIN_VIEWS) {
        const views = randomViews();
        await post.update({ viewCount: views });
        logger.info(`  ${post.get("slug")}: ${current} → ${views}`);
        updated++;
      }
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
