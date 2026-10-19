// End-to-end API smoke test: boots the server on a temp DB and walks the demo flow.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = 6900 + Math.floor(Math.random() * 90);
const BASE = `http://localhost:${PORT}/api/v1`;
const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "es-")), "test.db");
let server;

const call = async (p, { token, ...opts } = {}) => {
  const res = await fetch(BASE + p, {
    ...opts,
    headers: { "content-type": "application/json", ...(token && { authorization: `Bearer ${token}` }) },
    body: opts.body && JSON.stringify(opts.body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};

before(async () => {
  server = spawn(process.execPath, ["src/index.js"], {
    env: { ...process.env, PORT, DB_PATH: dbPath, UPLOAD_DIR: path.join(path.dirname(dbPath), "uploads"), ALLOW_DEV_LOGIN: "true", ADMIN_EMAILS: "", GOOGLE_CLIENT_ID: "" },
    stdio: process.env.TEST_DEBUG ? "inherit" : "ignore",
  });
  for (let i = 0; i < 150; i++) {
    try {
      if ((await fetch(`${BASE}/health`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("server did not start");
});

after(() => server?.kill());

test("seed has 50+ upcoming events and search filters work", async () => {
  const all = await call("/events");
  assert.ok(all.body.events.length >= 50);
  const q = await call("/events?q=quiz&type=Cultural");
  assert.ok(q.body.events.length > 0);
  assert.ok(q.body.events.every((e) => e.category === "Cultural"));
});

test("only @kiit.ac.in emails may log in", async () => {
  const res = await call("/auth/dev-login", { method: "POST", body: { email: "a@gmail.com" } });
  assert.equal(res.status, 403);
});

test("student onboarding, follow and recommendations", async () => {
  const { body } = await call("/auth/dev-login", { method: "POST", body: { email: "s1@kiit.ac.in" } });
  const token = body.token;
  assert.equal((await call("/auth/me", { method: "PATCH", token, body: { interests: ["Music"] } })).status, 400);
  const me = await call("/auth/me", { method: "PATCH", token, body: { interests: ["Music", "Dance", "Drama"] } });
  assert.equal(me.body.user.onboarded, true);
  const rec = await call("/events/recommended", { token });
  assert.ok(rec.body.events.every((e) => e.tags.some((t) => ["Music", "Dance", "Drama"].includes(t))));
  const f = await call("/societies/soc_kmc/follow", { method: "POST", token });
  assert.deepEqual(f.body.user.following, ["soc_kmc"]);
  assert.equal((await call("/admin/events", { token })).status, 403);
});

test("admin creates a draft, publishes it, and it appears in the feed", async () => {
  const { body } = await call("/auth/dev-login", {
    method: "POST",
    body: { email: "rep@kiit.ac.in", asAdmin: true, societyId: "soc_kmc" },
  });
  const token = body.token;
  const event = {
    title: "Test Jam", category: "Cultural", venue: "KSAC", date: "2099-01-01",
    startTime: "18:00", endTime: "20:00", description: "x", registrationLink: "https://example.com",
    status: "Draft", tags: ["Music"],
  };
  assert.equal((await call("/admin/events", { method: "POST", token, body: { ...event, endTime: "17:00" } })).status, 400);
  const created = await call("/admin/events", { method: "POST", token, body: event });
  assert.equal(created.status, 201);
  const id = created.body.event.id;
  assert.ok(!(await call("/events?q=test jam")).body.events.length);
  await call(`/admin/events/${id}`, { method: "PUT", token, body: { status: "Published" } });
  assert.equal((await call("/events?q=test jam")).body.events[0].id, id);
  assert.equal((await call(`/admin/events/${id}`, { method: "DELETE", token })).status, 204);
});

const loginRep = async (email, societyId) =>
  (await call("/auth/dev-login", { method: "POST", body: { email, asAdmin: true, societyId } })).body.token;

const baseEvent = {
  title: "Upload Test", category: "Technical", venue: "C6", date: "2099-02-01",
  startTime: "10:00", endTime: "11:00", description: "x", registrationLink: "https://example.com",
};

test("banner uploads are stored as files, archived events leave the feed", async () => {
  const token = await loginRep("rep2@kiit.ac.in", "soc_gdg");
  // 1x1 transparent PNG
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const created = await call("/admin/events", { method: "POST", token, body: { ...baseEvent, bannerImageUrl: png } });
  assert.equal(created.status, 201);
  const url = created.body.event.bannerImageUrl;
  assert.match(url, /^\/uploads\/[a-f0-9]+\.png$/);
  const img = await fetch(`http://localhost:${PORT}${url}`);
  assert.equal(img.status, 200);

  const bad = await call("/admin/events", { method: "POST", token, body: { ...baseEvent, bannerImageUrl: "data:image/svg+xml;base64,AAAA" } });
  assert.equal(bad.status, 400);

  const id = created.body.event.id;
  assert.equal((await call("/events?q=upload test")).body.events.length, 1);
  await call(`/admin/events/${id}`, { method: "PUT", token, body: { status: "Archived" } });
  assert.equal((await call("/events?q=upload test")).body.events.length, 0);
  assert.equal((await call(`/events/${id}`)).status, 404);
});

test("reps cannot edit another society's events", async () => {
  const gdg = await loginRep("rep3@kiit.ac.in", "soc_gdg");
  const kmc = await loginRep("rep4@kiit.ac.in", "soc_kmc");
  const { body } = await call("/admin/events", { method: "POST", token: gdg, body: baseEvent });
  const res = await call(`/admin/events/${body.event.id}`, { method: "PUT", token: kmc, body: { title: "hijack" } });
  assert.equal(res.status, 403);
});

test("Google login is refused when GOOGLE_CLIENT_ID is not configured", async () => {
  const res = await call("/auth/google", { method: "POST", body: { credential: "fake" } });
  assert.equal(res.status, 503);
});

test("production refuses to start with the default JWT secret", () => {
  const out = spawnSync(process.execPath, ["src/index.js"], {
    env: { ...process.env, NODE_ENV: "production", JWT_SECRET: "", PORT: PORT + 1, DB_PATH: dbPath },
    encoding: "utf-8",
    timeout: 10000,
  });
  assert.equal(out.status, 1);
  assert.match(out.stderr, /JWT_SECRET/);
});
