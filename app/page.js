export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Pult Fullstack Test</h1>
      <p>Next.js app with PostgreSQL + Redis on Pult.</p>
      <h2>API Endpoints</h2>
      <ul>
        <li><a href="/api/health">/api/health</a> — Health check</li>
        <li><a href="/api/env-check">/api/env-check</a> — Env var status</li>
        <li><a href="/api/db-test">/api/db-test</a> — PostgreSQL test</li>
        <li><a href="/api/redis-test">/api/redis-test</a> — Redis test</li>
      </ul>
    </main>
  );
}
