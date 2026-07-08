export type BreakdownRow = {
  key: string
  label: string
  totalCalls: number
  tokensSaved: number
  estimatedCostUsd: number
  costSavedUsd: number
}

export function SavingsBreakdownTable({
  rows,
  variant = 'default',
}: {
  rows: BreakdownRow[]
  variant?: 'default' | 'model'
}) {
  const totalSaved = rows.reduce((sum, r) => sum + r.costSavedUsd, 0)
  function usd(value: number) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No data for this period.
      </p>
    )
  }

  if (variant === 'model') {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-paragraph border-stock border-b text-left">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Estimated Cost</th>
            <th className="px-6 py-3 font-medium">Savings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-stock border-b last:border-b-0">
              <td className="text-foreground px-6 py-3">{row.label}</td>
              <td className="text-foreground px-6 py-3">
                {usd(row.estimatedCostUsd)}
              </td>
              <td className="text-foreground px-6 py-3">
                {usd(row.costSavedUsd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-paragraph border-stock border-b text-left">
          <th className="px-6 py-3 font-medium">Name</th>
          <th className="px-6 py-3 font-medium">Calls</th>
          <th className="px-6 py-3 font-medium">Tokens Saved</th>
          <th className="px-6 py-3 font-medium">$ Saved</th>
          <th className="px-6 py-3 font-medium">% of Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-stock border-b last:border-b-0">
            <td className="text-foreground px-6 py-3">{row.label}</td>
            <td className="text-foreground px-6 py-3">
              {row.totalCalls.toLocaleString()}
            </td>
            <td className="text-foreground px-6 py-3">
              {row.tokensSaved.toLocaleString()}
            </td>
            <td className="text-foreground px-6 py-3">
              {usd(row.costSavedUsd)}
            </td>
            <td className="text-foreground px-6 py-3">
              {totalSaved > 0
                ? `${((row.costSavedUsd / totalSaved) * 100).toFixed(1)}%`
                : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
