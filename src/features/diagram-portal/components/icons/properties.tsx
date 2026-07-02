import { cn } from '@/lib/utils'
import styles from './styles.module.css'

export function CrossIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M10.8006 2.94556L3.10059 10.6456M3.10059 2.94556L10.8006 10.6456"
        stroke="currentColor"
        strokeWidth="0.825"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
