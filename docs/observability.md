# Phase 12 — Observability

> Metrics, logging, tracing, error monitoring, and health checks. Implemented as thin
> abstractions in `src/lib/observability/*` so they can be pointed at real backends (OTel,
> Datadog, Loki, Prometheus) without touching call sites.

## Logging

- `src/lib/observability/logger.ts` emits **structured JSON lines** (`level`, `message`,
  `time`, + fields) at `debug/info/warn/error`, level-filtered by `LOG_LEVEL`
  (default `info` in prod, `debug` in dev).
- `logger.child({ context })` attaches persistent context (e.g. request id, route).
- Swap the `emit` sink to forward to a log shipper; call sites are unchanged.

## Metrics

- `src/lib/observability/metrics.ts` is an in-memory registry of **counters** and
  **histograms** with label support, mirroring OTel/Prometheus semantics.
- Emitted today: `http.request{route}`, `http.error{route}` (route handlers via `handle()`),
  `span.duration_ms{span}`, `span.error{span}` (tracing).
- Exposed at **`GET /api/metrics`** (manager+ only). Replace the registry with an OTel meter /
  Prometheus client for production scraping.

## Tracing

- `src/lib/observability/tracing.ts` `withSpan(name, fn, attrs)` wraps an async operation,
  records duration as a histogram, and logs failures — the shape of an OTel span. Replace with
  a real tracer/exporter (`OTEL_EXPORTER_OTLP_ENDPOINT` placeholder in `.env.example`).

## Error monitoring

- Route handlers funnel through `handle()` (`src/lib/api/route-helpers.ts`): unknown errors are
  logged (`route.unhandled`) and returned as sanitized `500`s; `ApiError`s map to their status.
  This is the integration point for Sentry/Bugsnag (`captureException`).
- The UI surfaces failures via `ErrorState` (retry) and `sonner` toasts.

## Health checks

- **`GET /api/health`** (`src/lib/observability/health.ts`) returns `status`
  (`ok`/`degraded`/`down`), `uptimeSeconds`, `version`, and per-dependency checks; responds
  `503` when down. Suitable for load-balancer / k8s liveness+readiness probes.

## Audit vs. observability

The **audit trail** (`src/lib/audit`) is a security record (who did what, when, from where),
retained and shown in-product. **Observability** is operational telemetry (performance,
errors, health). They are complementary and both feed structured logs.

## Production wiring checklist

- [ ] Point `logger` at a shipper (OTLP/Datadog/Loki) with sampling.
- [ ] Replace `metrics` with an OTel meter or `prom-client`; scrape `/api/metrics`.
- [ ] Configure an OTel tracer/exporter; propagate trace context in `proxy.ts`.
- [ ] Add Sentry (or similar) in `handle()` and a React error boundary.
- [ ] Wire `/api/health` to real dependency probes (DB, cache, downstream APIs).
