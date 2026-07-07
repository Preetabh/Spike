import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

let redis = null;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
    });
    redis.on("connect", () => {
      console.log("✅ Redis Connected Successfully");
    });
    redis.on("error", (err) => {
      console.warn("⚠️ Redis Connection Error:", err.message);
    });
  } catch (error) {
    console.error("❌ Redis Initialization Failed:", error.message);
  }
} else {
  console.warn("⚠️ REDIS_URL is not set. Caching is disabled.");
}

export { redis };
export default redis;
