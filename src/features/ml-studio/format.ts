export function formatMetric(value: number) {
  if (Number.isInteger(value)) return String(value)
  return Number(value.toPrecision(4)).toString()
}
