import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

export type RepositorySpec = {
  fullName: string
  owner: string
  name: string
  defaultBranch: string
  private: boolean
  url: string
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-stock flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0">
      <span className="text-paragraph shrink-0 font-mono text-[0.625rem] tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="truncate font-mono text-sm">{value}</span>
    </div>
  )
}

export function RepositoryCard({
  repository,
}: {
  repository: RepositorySpec | null
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <AnimatePresence mode="wait">
        {!repository && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-stock text-paragraph flex h-64 items-center justify-center rounded-2xl border border-dashed font-mono text-[0.6875rem] tracking-[0.18em] uppercase"
          >
            No repository selected
          </motion.div>
        )}

        {repository && (
          <motion.div
            key={repository.fullName}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="border-stock bg-shading rounded-2xl border p-6"
          >
            <p className="text-paragraph font-mono text-[0.625rem] tracking-[0.18em] uppercase">
              Selected repository
            </p>
            <p className="mt-3 truncate text-xl font-medium">
              {repository.name}
            </p>

            <div className="mt-5">
              <SpecRow label="Owner" value={repository.owner} />
              <SpecRow label="Branch" value={repository.defaultBranch} />
              <SpecRow
                label="Visibility"
                value={repository.private ? 'Private' : 'Public'}
              />
            </div>

            <a
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm hover:underline"
            >
              Open on GitHub <ExternalLink className="size-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
