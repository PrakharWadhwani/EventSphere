import fs from "fs";
import path from "path";
import crypto from "crypto";

// Banner uploads arrive as data URLs and are written to disk, so the DB only stores a short path.
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./data/uploads");
export const UPLOAD_PREFIX = "/uploads/";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const MAX_BYTES = 3 * 1024 * 1024;

export const isDataImage = (s) => typeof s === "string" && s.startsWith("data:image/");

/** Validates a data URL. Returns an error message or null. */
export function checkDataImage(dataUrl) {
  const m = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m || !TYPES[m[1]]) return "Banner must be a JPEG, PNG, WEBP or GIF image.";
  if ((m[2].length * 3) / 4 > MAX_BYTES) return "Banner image is too large (max 3MB).";
  return null;
}

/** Writes the image and returns its public URL path. */
export function saveDataImage(dataUrl) {
  const [, mime, b64] = /^data:(image\/[a-z]+);base64,(.+)$/.exec(dataUrl);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomBytes(10).toString("hex")}.${TYPES[mime]}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(b64, "base64"));
  return UPLOAD_PREFIX + name;
}

/** Deletes a previously uploaded file (no-op for external URLs). */
export function removeUpload(url) {
  if (typeof url !== "string" || !url.startsWith(UPLOAD_PREFIX)) return;
  const file = path.join(UPLOAD_DIR, path.basename(url));
  fs.promises.unlink(file).catch(() => {});
}
