import { logger } from "./logger";
import { metrics } from "./metrics";

/**
 * Lightweight span helper. Wraps an async operation, records its duration as a
 * histogram, and logs failures. Mirrors the shape of an OpenTelemetry span so it
 * can be replaced by a real tracer.
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    metrics.observe("span.duration_ms", duration, { span: name });
    logger.debug("span.complete", { span: name, duration_ms: duration, ...attributes });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metrics.increment("span.error", { span: name });
    logger.error("span.error", {
      span: name,
      duration_ms: duration,
      error: error instanceof Error ? error.message : String(error),
      ...attributes,
    });
    throw error;
  }
}
