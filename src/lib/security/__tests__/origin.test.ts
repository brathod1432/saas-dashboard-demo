import type { NextRequest } from "next/server";
import { assertSameOrigin } from "@/lib/security/origin";
import { ApiError } from "@/lib/api/errors";

/** Build the minimal NextRequest shape `assertSameOrigin` actually reads. */
function makeReq(headers: Record<string, string>, host = "app.example.com"): NextRequest {
  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
    nextUrl: { host },
  } as unknown as NextRequest;
}

describe("assertSameOrigin (CSRF guard)", () => {
  it("allows same-origin fetch-metadata requests", () => {
    expect(() =>
      assertSameOrigin(makeReq({ "sec-fetch-site": "same-origin" }))
    ).not.toThrow();
  });

  it("allows direct navigations (sec-fetch-site: none)", () => {
    expect(() => assertSameOrigin(makeReq({ "sec-fetch-site": "none" }))).not.toThrow();
  });

  it("blocks cross-site requests via fetch metadata", () => {
    expect(() => assertSameOrigin(makeReq({ "sec-fetch-site": "cross-site" }))).toThrow(
      ApiError
    );
  });

  it("falls back to Origin host comparison when metadata is absent", () => {
    expect(() =>
      assertSameOrigin(
        makeReq({ origin: "https://app.example.com", host: "app.example.com" })
      )
    ).not.toThrow();
    expect(() =>
      assertSameOrigin(makeReq({ origin: "https://evil.com", host: "app.example.com" }))
    ).toThrow(ApiError);
  });

  it("allows requests with neither metadata nor origin (still auth-gated elsewhere)", () => {
    expect(() => assertSameOrigin(makeReq({}))).not.toThrow();
  });
});
