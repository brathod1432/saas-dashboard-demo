import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { db } from "@/lib/mock/data";
import { logger } from "@/lib/observability/logger";

/**
 * Optional file-backed persistence for the mock datastore so demo edits, imports,
 * and role changes survive server restarts. Demo-grade only — a real app uses a
 * database. Disabled during tests and can be turned off with PERSIST_DB=false.
 *
 * Hydration runs synchronously at module load so the SAME `db` instance the route
 * handlers use is populated (in Next dev, `instrumentation` can run in a separate
 * module context, so we must not rely on it alone). Only mutable collections are
 * persisted; KPIs and chart series stay seeded.
 */

const ENABLED = process.env.NODE_ENV !== "test" && process.env.PERSIST_DB !== "false";
const DATA_DIR = ".data";
const DATA_FILE = `${DATA_DIR}/db.json`;

type Persisted = Pick<
  typeof db,
  "users" | "customers" | "projects" | "invoices" | "auditLog" | "settings"
>;

function snapshot(): Persisted {
  return {
    users: db.users,
    customers: db.customers,
    projects: db.projects,
    invoices: db.invoices,
    auditLog: db.auditLog,
    settings: db.settings,
  };
}

/** Replace an array's contents in place so existing imported references stay valid. */
function replaceInPlace<T>(target: T[], next: T[] | undefined) {
  if (Array.isArray(next)) target.splice(0, target.length, ...next);
}

let hydrated = false;

/** Load persisted data (if any) into the in-memory db. Idempotent. */
export function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  if (!ENABLED || !existsSync(DATA_FILE)) return;
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<Persisted>;
    replaceInPlace(db.users, parsed.users);
    replaceInPlace(db.customers, parsed.customers);
    replaceInPlace(db.projects, parsed.projects);
    replaceInPlace(db.invoices, parsed.invoices);
    replaceInPlace(db.auditLog, parsed.auditLog);
    if (parsed.settings) Object.assign(db.settings, parsed.settings);
    logger.info("persistence.hydrated", { file: DATA_FILE });
  } catch (error) {
    logger.warn("persistence.hydrate_failed", { error: String(error) });
  }
}

// Hydrate as soon as this module is imported in a request/server context.
ensureHydrated();

let writeTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced, fire-and-forget write of the current db to disk. */
export function persist(): void {
  if (!ENABLED) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(writeNow, 300);
}

function writeNow(): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(snapshot(), null, 2), "utf8");
  } catch (error) {
    logger.warn("persistence.write_failed", { error: String(error) });
  }
}
