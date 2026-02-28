import Redis from "ioredis";

export async function GET() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return Response.json({ error: "REDIS_URL not set" }, { status: 503 });
  }

  const redis = new Redis(redisUrl, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  try {
    const connectStart = Date.now();
    await redis.connect();
    const connectMs = Date.now() - connectStart;

    // Test SET/GET
    const testKey = `pult:test:${Date.now()}`;
    await redis.set(testKey, "hello-from-pult", "EX", 60);
    const value = await redis.get(testKey);

    // Increment a counter
    const counter = await redis.incr("pult:test:counter");

    // Get server info
    const info = await redis.info("server");
    const versionMatch = info.match(/redis_version:(.+)/);
    const version = versionMatch ? versionMatch[1].trim() : "unknown";

    const dbSize = await redis.dbsize();

    return Response.json({
      status: "connected",
      connect_ms: connectMs,
      redis_version: version,
      set_get_ok: value === "hello-from-pult",
      counter: counter,
      db_size: dbSize,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    await redis.quit().catch(() => {});
  }
}
