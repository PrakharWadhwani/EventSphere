// Load test for the PRD's "20 concurrent demo users" requirement.
// Usage: start the server, then `npm run loadtest` (BASE_URL defaults to http://localhost:6767).
// Note: the API rate limit (RATE_LIMIT_PER_MIN, default 3000/min per IP) will reject most
// requests from a single machine, so start the server with RATE_LIMIT_PER_MIN=1000000 for this test.
import autocannon from "autocannon";

const BASE = process.env.BASE_URL || "http://localhost:6767";
const CONNECTIONS = Number(process.env.CONNECTIONS) || 20;
const DURATION = Number(process.env.DURATION) || 15;

const login = await fetch(`${BASE}/api/v1/auth/dev-login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "loadtest@kiit.ac.in" }),
});
if (!login.ok) throw new Error(`Dev login failed (${login.status}). Is ALLOW_DEV_LOGIN on?`);
const { token } = await login.json();
await fetch(`${BASE}/api/v1/auth/me`, {
  method: "PATCH",
  headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
  body: JSON.stringify({ interests: ["Coding", "Music", "Robotics"] }),
});

// A student session: feed, today, recommendations, a search, a detail page, societies.
const auth = { authorization: `Bearer ${token}` };
const requests = [
  { path: "/api/v1/events" },
  { path: "/api/v1/events?date=today" },
  { path: "/api/v1/events/recommended", headers: auth },
  { path: "/api/v1/events?q=hackathon&type=Technical" },
  { path: "/api/v1/events?q=music" },
  { path: "/api/v1/societies" },
  { path: "/api/v1/auth/me", headers: auth },
];

console.log(`Load testing ${BASE} with ${CONNECTIONS} concurrent users for ${DURATION}s...`);
const result = await autocannon({ url: BASE, connections: CONNECTIONS, duration: DURATION, requests });

const non2xx = result.non2xx + result.errors + result.timeouts;
console.log(`
Requests:     ${result.requests.total} (${Math.round(result.requests.average)} req/s)
Latency:      avg ${result.latency.average} ms, p50 ${result.latency.p50} ms, p99 ${result.latency.p99} ms, max ${result.latency.max} ms
Failures:     ${non2xx} (non-2xx ${result.non2xx}, errors ${result.errors}, timeouts ${result.timeouts})
`);
process.exit(non2xx === 0 && result.latency.p99 < 1000 ? 0 : 1);
