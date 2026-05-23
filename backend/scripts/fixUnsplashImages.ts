/**
 * Fix dead Unsplash seed images
 * Replaces https://images.unsplash.com/photo-... URLs (many now 404) with picsum placeholders
 * Usage: npx ts-node scripts/fixUnsplashImages.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

import Ad from "../models/Ad";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/reachripple-dev";
const UNSPLASH_RE = /^https?:\/\/(images|source)\.unsplash\.com\//i;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const ads = await Ad.find({
    images: { $regex: UNSPLASH_RE },
    isDeleted: { $ne: true },
  });

  console.log(`Found ${ads.length} ads with Unsplash images`);

  let totalReplaced = 0;
  for (const ad of ads) {
    const idHash = (ad as any)._id.toString().slice(-4);
    const seedBase = parseInt(idHash, 16) % 1000;
    let i = 0;
    const updated = (ad as any).images.map((img: string) => {
      if (UNSPLASH_RE.test(img)) {
        const newUrl = `https://picsum.photos/seed/${seedBase + i++}/500/600`;
        totalReplaced++;
        return newUrl;
      }
      return img;
    });
    await Ad.updateOne({ _id: ad._id }, { $set: { images: updated } });
    console.log(`  Fixed: ${(ad as any).title}`);
  }

  console.log(`\nDone! Replaced ${totalReplaced} Unsplash URLs across ${ads.length} ads.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
