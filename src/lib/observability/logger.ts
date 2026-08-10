/**
 * Structured logger abstraction.
 *
 * Emits JSON lines so logs are machine-parseable by any aggregator (Datadog,
 * Loki, CloudWatch). Swap the `sink` to forward to a real transport without
 * touching call sites. See docs/observability.md.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

export interface LogFields {
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, fields?: LogFields): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[MIN_LEVEL]) return;
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  // Route to the appropriate console channel; a real sink would ship this out.
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
  /** Create a child logger that always includes the given context. */
  child(context: LogFields) {
    return {
      debug: (m: string, f?: LogFields) => emit("debug", m, { ...context, ...f }),
      info: (m: string, f?: LogFields) => emit("info", m, { ...context, ...f }),
      warn: (m: string, f?: LogFields) => emit("warn", m, { ...context, ...f }),
      error: (m: string, f?: LogFields) => emit("error", m, { ...context, ...f }),
    };
  },
};
