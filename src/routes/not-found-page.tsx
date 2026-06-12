import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BiHome } from 'react-icons/bi'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-8 flex items-center justify-center">
          <UiGraphLogo className="size-24" />
        </div>

        <h1 className="mb-2 font-mono text-7xl font-bold tracking-tight text-[var(--foreground)]">
          404
        </h1>

        <h2 className="text-foreground mb-4 text-xl font-semibold">
          Page Not Found
        </h2>

        <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <Button asChild preset="primary">
          <Link to="/dashboard">
            <BiHome className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
