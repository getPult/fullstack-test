export async function GET() {
  const vars = [
    "DATABASE_URL",
    "REDIS_URL",
    "PULT_JWT_SECRET",
    "PULT_REDIS_URL",
    "PULT_STORAGE_URL",
    "PULT_REALTIME_URL",
    "PORT",
  ];

  const result = {};
  for (const v of vars) {
    const val = process.env[v];
    if (!val) {
      result[v] = null;
    } else if (v.includes("SECRET") || v.includes("PASSWORD")) {
      result[v] = val.substring(0, 8) + "...";
    } else if (v.includes("URL")) {
      // Show URL but mask password if present
      result[v] = val.replace(/:([^@:]+)@/, ":***@");
    } else {
      result[v] = val;
    }
  }

  return Response.json({ env_vars: result });
}
