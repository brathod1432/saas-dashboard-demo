import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("session tokens", () => {
  const input = {
    userId: "usr_admin",
    role: "admin" as const,
    name: "Priya Sharma",
    email: "admin@nexusops.demo",
  };

  it("creates a token that verifies back to the session", async () => {
    const token = await createSessionToken(input);
    const session = await verifySessionToken(token);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("usr_admin");
    expect(session?.role).toBe("admin");
    expect(session?.expiresAt).toBeGreaterThan(session!.issuedAt);
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken(input);
    const [, signature] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...input, role: "admin", expiresAt: 9999999999 })
    ).toString("base64url");
    const forged = `${forgedPayload}.${signature}`;
    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("rejects malformed and empty tokens", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken("not-a-token")).toBeNull();
  });
});
