export function ComponentMetaField({
  error,
  label,
  required,
  children,
  componentType,
}: {
  label: React.ReactNode
  required: boolean
  componentType: string
  children: React.ReactNode
  error: string | undefined | null
}) {
  return (
    <div className="mb-6">
      <label
        data-component-type={componentType}
        data-has-error={error ? 'true' : null}
        className="text-foreground mb-3 block text-sm font-medium capitalize"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <div>{children}</div>

      {error && (
        <p className="text-destructive mt-2 overflow-hidden text-xs">{error}</p>
      )}
    </div>
  )
}
