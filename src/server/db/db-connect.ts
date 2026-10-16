import "server-only";
import mongoose from "mongoose";

/**
 * Cached across invocations so a warm serverless instance (or a dev hot
 * reload) reuses one connection instead of opening a new one per request.
 * Caches the in-flight *promise*, not just a flag: concurrent cold-start
 * requests then await the same connection attempt instead of each calling
 * `mongoose.connect()` on their own.
 */
let connectionPromise: Promise<typeof mongoose> | null = null;

/** Per-instance cap: keeps many concurrent serverless instances from each
 * opening a large pool and exhausting the database's total connection
 * limit. 10 is enough concurrency for one instance's own requests. */
const MAX_POOL_SIZE = 10;
/** Fail fast on a dead database instead of hanging on the driver's 30s
 * default, so a connection problem surfaces as a quick error, not a
 * slow-looking request. */
const SERVER_SELECTION_TIMEOUT_MS = 10_000;

async function dbConnect(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  connectionPromise ??= mongoose
    .connect(process.env.MONGODB_URI || "", {
      maxPoolSize: MAX_POOL_SIZE,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    })
    .catch((err: unknown) => {
      // Let the next call retry instead of replaying a rejected promise.
      connectionPromise = null;
      throw err;
    });

  try {
    await connectionPromise;
  } catch (err) {
    throw new Error("Database connection failed", { cause: err });
  }
}

export default dbConnect;
