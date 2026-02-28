import pg from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return Response.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  // Strip sslmode from URL to avoid pg driver conflict, handle SSL explicitly
  const cleanUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");
  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const connectStart = Date.now();
    await client.connect();
    const connectMs = Date.now() - connectStart;

    // Test query
    const queryStart = Date.now();
    const res = await client.query("SELECT NOW() as now, current_database() as db, current_user as usr, version() as pg_version");
    const queryMs = Date.now() - queryStart;

    // Create a test table and insert
    await client.query(`
      CREATE TABLE IF NOT EXISTS pult_test (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query("INSERT INTO pult_test (message) VALUES ($1)", [`test-${Date.now()}`]);
    const countRes = await client.query("SELECT COUNT(*) as count FROM pult_test");

    return Response.json({
      status: "connected",
      connect_ms: connectMs,
      query_ms: queryMs,
      server_time: res.rows[0].now,
      database: res.rows[0].db,
      user: res.rows[0].usr,
      pg_version: res.rows[0].pg_version.split(" ").slice(0, 2).join(" "),
      test_table_rows: parseInt(countRes.rows[0].count),
    });
  } catch (err) {
    return Response.json({ error: err.message, code: err.code }, { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
