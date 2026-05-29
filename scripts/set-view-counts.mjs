import { connectDatabase } from "../dist/config/database.js";
import { BlogPost } from "../dist/models/index.js";

const args = process.argv.slice(2);
const MIN = parseInt(args[0] || "10", 10);
const MAX = parseInt(args[1] || "500", 10);
const RECENT_MAX = parseInt(args[2] || "60", 10);

if (isNaN(MIN) || isNaN(MAX) || isNaN(RECENT_MAX) || MIN < 0 || MAX < MIN || RECENT_MAX < MIN) {
  console.error("Usage: node scripts/set-view-counts.mjs [min] [max_old] [max_recent]");
  console.error("  min         - minimum view count floor (default: 10)");
  console.error("  max_old     - max range for oldest articles (default: 500)");
  console.error("  max_recent  - max range for newest articles (default: 60)");
  process.exit(1);
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  try {
    console.log(`[set-view-counts] min=${MIN}, max_old=${MAX}, max_recent=${RECENT_MAX}`);
    await connectDatabase();

    const posts = await BlogPost.findAll({ order: [["createdAt", "ASC"]] });
    const oldest = posts[0]?.createdAt;
    const newest = posts[posts.length - 1]?.createdAt;
    const ageRange = oldest && newest ? newest.getTime() - oldest.getTime() : 1;

    let updated = 0;

    for (const post of posts) {
      const current = post.viewCount;

      if (current >= MIN) continue;

      const ratio = ageRange > 0 ? (post.createdAt.getTime() - oldest.getTime()) / ageRange : 0.5;
      const postMax = Math.round(RECENT_MAX + (MAX - RECENT_MAX) * (1 - ratio));
      const views = randomInRange(MIN, Math.max(postMax, MIN));

      await post.update({ viewCount: views });
      console.log(`  ${String(post.slug).padEnd(40)} ${current} \u2192 ${views} (age:${(ratio * 100).toFixed(0)}%)`);
      updated++;
    }

    console.log(`[set-view-counts] Updated ${updated} / ${posts.length} blog posts`);
    process.exit(0);
  } catch (error) {
    console.error("set-view-counts failed:", error);
    if (error?.parent) console.error("Parent error:", error.parent);
    process.exit(1);
  }
}

run();
