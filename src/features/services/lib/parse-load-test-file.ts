import { GT } from '@/api'

class LoadTestParseError extends Error {}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function isFullLoadTestMetrics(
  value: unknown
): value is GT.LoadTestMetricsInput {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.p95LatencyMs === 'number' && typeof v.requestsPerSec === 'number'
  )
}

/**
 * Parses a k6 `--summary-export` JSON file. k6's default summary only carries
 * aggregate metrics (no time series, no per-endpoint breakdown), so those
 * arrays come back empty — the results view degrades gracefully when they're
 * empty rather than pretending data exists.
 */
function parseK6Summary(
  json: Record<string, unknown>
): GT.LoadTestMetricsInput {
  const metrics = json.metrics as Record<string, unknown> | undefined
  if (!metrics || typeof metrics !== 'object') {
    throw new LoadTestParseError(
      'This file does not look like a k6 summary export (missing "metrics").'
    )
  }

  const httpReqs = metrics.http_reqs as Record<string, unknown> | undefined
  const duration = metrics.http_req_duration as
    Record<string, unknown> | undefined
  const failed = metrics.http_req_failed as Record<string, unknown> | undefined
  const vus = metrics.vus_max ?? metrics.vus

  if (!duration) {
    throw new LoadTestParseError(
      'This file is missing the "http_req_duration" metric k6 reports by default.'
    )
  }

  const durationValues = (duration.values ?? duration) as Record<
    string,
    unknown
  >
  const httpReqsValues = (httpReqs?.values ?? httpReqs ?? {}) as Record<
    string,
    unknown
  >
  const failedValues = (failed?.values ?? failed ?? {}) as Record<
    string,
    unknown
  >
  const vusValues = (
    typeof vus === 'object' && vus
      ? ((vus as Record<string, unknown>).values ?? vus)
      : { value: vus }
  ) as Record<string, unknown>

  const totalRequests = num(httpReqsValues.count)
  const testRunDurationMs = num(
    (json.state as Record<string, unknown> | undefined)?.testRunDurationMs
  )
  const durationSec = testRunDurationMs > 0 ? testRunDurationMs / 1000 : 0

  return {
    durationSec,
    totalRequests,
    requestsPerSec:
      num(httpReqsValues.rate) ||
      (durationSec > 0 ? totalRequests / durationSec : 0),
    errorRate: num(failedValues.rate),
    minLatencyMs: num(durationValues.min),
    avgLatencyMs: num(durationValues.avg),
    maxLatencyMs: num(durationValues.max),
    p50LatencyMs: num(durationValues.med ?? durationValues['p(50)']),
    p90LatencyMs: num(durationValues['p(90)']),
    p95LatencyMs: num(durationValues['p(95)']),
    p99LatencyMs: num(durationValues['p(99)']),
    virtualUsers: num(vusValues.value),
    timeSeries: [],
    perEndpoint: [],
  }
}

const TIME_COLUMN_NAMES = [
  'time',
  '_time',
  'timestamp',
  'datetime',
  'date',
  't',
]

function parseTimeCell(cell: string, firstValue: number | null): number {
  const asNumber = Number(cell)
  if (Number.isFinite(asNumber)) {
    return firstValue === null ? 0 : asNumber - firstValue
  }
  const asDate = Date.parse(cell)
  if (Number.isFinite(asDate)) {
    return firstValue === null ? 0 : (asDate - firstValue) / 1000
  }
  return 0
}

function timeCellRawValue(cell: string): number | null {
  const asNumber = Number(cell)
  if (Number.isFinite(asNumber)) return asNumber
  const asDate = Date.parse(cell)
  return Number.isFinite(asDate) ? asDate : null
}

/**
 * Parses a generic "time, metric1, metric2, ..." CSV export — the common
 * shape produced by Grafana panel "Inspect → Download CSV", a Splunk search
 * export, or a SignalFx chart export. Each non-time numeric column becomes
 * its own custom metric with a time series, so the results view can chart
 * it — this doesn't attempt to guess which column is RPS/latency/etc., it
 * just brings the data in for review.
 */
function parseGenericTimeSeriesCsv(rawText: string): GT.LoadTestMetricsInput {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    throw new LoadTestParseError(
      'This CSV needs a header row plus at least one data row.'
    )
  }

  const header = lines[0].split(',').map((h) => h.trim())
  const rows = lines
    .slice(1)
    .map((line) => line.split(',').map((c) => c.trim()))

  const timeColIndex = header.findIndex((h) =>
    TIME_COLUMN_NAMES.includes(h.toLowerCase())
  )

  let firstTimeValue: number | null = null
  if (timeColIndex >= 0) {
    firstTimeValue = timeCellRawValue(rows[0][timeColIndex] ?? '')
  }

  const customMetrics: GT.LoadTestMetricsInput['customMetrics'] = []
  header.forEach((columnName, colIndex) => {
    if (colIndex === timeColIndex) return

    const values = rows.map((row) => Number(row[colIndex]))
    const isNumericColumn = values.every((v) => Number.isFinite(v))
    if (!isNumericColumn) return

    const timeSeries = rows.map((row, rowIndex) => ({
      t:
        timeColIndex >= 0
          ? parseTimeCell(row[timeColIndex] ?? '', firstTimeValue)
          : rowIndex,
      v: values[rowIndex],
    }))

    customMetrics.push({
      name: columnName,
      value: values[values.length - 1],
      timeSeries,
    })
  })

  if (customMetrics.length === 0) {
    throw new LoadTestParseError('No numeric metric columns found in this CSV.')
  }

  const durationSec =
    timeColIndex >= 0 && rows.length > 1
      ? Math.max(
          0,
          parseTimeCell(
            rows[rows.length - 1][timeColIndex] ?? '',
            firstTimeValue
          )
        )
      : 0

  return {
    durationSec,
    totalRequests: 0,
    requestsPerSec: 0,
    errorRate: 0,
    minLatencyMs: 0,
    avgLatencyMs: 0,
    maxLatencyMs: 0,
    p50LatencyMs: 0,
    p90LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    virtualUsers: 0,
    timeSeries: [],
    perEndpoint: [],
    customMetrics,
  }
}

export function parseLoadTestFile(
  rawText: string,
  fileName?: string
): GT.LoadTestMetricsInput {
  const looksLikeCsv =
    fileName?.toLowerCase().endsWith('.csv') ||
    (!rawText.trim().startsWith('{') && rawText.includes(','))

  if (looksLikeCsv) {
    return parseGenericTimeSeriesCsv(rawText)
  }

  let json: unknown
  try {
    json = JSON.parse(rawText)
  } catch {
    throw new LoadTestParseError('File is not valid JSON or CSV.')
  }

  if (isFullLoadTestMetrics(json)) {
    return json
  }

  if (json && typeof json === 'object' && 'metrics' in json) {
    return parseK6Summary(json as Record<string, unknown>)
  }

  throw new LoadTestParseError(
    'Unrecognized format. Expected a k6 --summary-export JSON file, or a CSV export from Grafana, Splunk, or SignalFx.'
  )
}

export { LoadTestParseError }
