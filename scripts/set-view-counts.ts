import { connectDatabase } from "../src/config/database.js";
import { BlogPost } from "../src/models/index.js";
import { logger } from "../src/utils/logger.js";

const args = process.argv.slice(2);
const MIN_VIEWS = parseInt(args[0] || "10", 10);
const MAX_VIEWS = parseInt(args[1] || "350", 10);

if (isNaN(MIN_VIEWS) || isNaN(MAX_VIEWS) || MIN_VIEWS < 0 || MAX_VIEWS < MIN_VIEWS) {
  console.error("Usage: npx tsx scripts/set-view-counts.ts [min] [max]");
  console.error("  min - minimum view count (default: 10)");
  console.error("  max - maximum random view count (default: 350)");
  process.exit(1);
}

function randomViews(): number {
  return Math.floor(Math.random() * (MAX_VIEWS - MIN_VIEWS + 1)) + MIN_VIEWS;
}

async function run() {
  try {
    logger.info(`Setting view counts (min=${MIN_VIEWS}, max=${MAX_VIEWS})...`);
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
