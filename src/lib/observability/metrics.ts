/**
 * Minimal in-memory metrics registry (counters + histograms).
 *
 * Interface mirrors OpenTelemetry / Prometheus semantics so it can be swapped
 * for a real exporter. Exposed via /api/health and /api/metrics.
 */

interface CounterState {
  type: "counter";
  value: number;
}
interface HistogramState {
  type: "histogram";
  count: number;
  sum: number;
  min: number;
  max: number;
}

type MetricState = CounterState | HistogramState;

const registry = new Map<string, MetricState>();

function key(name: string, labels?: Record<string, string>): string {
  if (!labels) return name;
  const parts = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(",");
  return `${name}{${parts}}`;
}

export const metrics = {
  increment(name: string, labels?: Record<string, string>, by = 1): void {
    const k = key(name, labels);
    const existing = registry.get(k);
    if (existing && existing.type === "counter") existing.value += by;
    else registry.set(k, { type: "counter", value: by });
  },

  observe(name: string, value: number, labels?: Record<string, string>): void {
    const k = key(name, labels);
    const existing = registry.get(k);
    if (existing && existing.type === "histogram") {
      existing.count += 1;
      existing.sum += value;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
    } else {
      registry.set(k, {
        type: "histogram",
        count: 1,
        sum: value,
        min: value,
        max: value,
      });
    }
  },

  snapshot(): Record<string, MetricState> {
    return Object.fromEntries(registry.entries());
  },

  reset(): void {
    registry.clear();
  },
};
