/**
 * Runs once when a Next.js server instance starts. Persistence hydration itself
 * happens synchronously at module load (see src/lib/mock/persistence.ts) so it
 * always targets the same `db` instance the route handlers use; this hook just
 * warms it in the Node.js runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureHydrated } = await import("@/lib/mock/persistence");
    ensureHydrated();
  }
}
