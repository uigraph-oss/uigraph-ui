import { cn } from '@/lib/utils'
import styles from './styles.module.css'

export function PlusIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M14.6668 8.67692C14.6668 4.99502 11.682 2.01025 8.00016 2.01025C4.31826 2.01025 1.3335 4.99502 1.3335 8.67692C1.3335 12.3588 4.31826 15.3436 8.00016 15.3436C11.682 15.3436 14.6668 12.3588 14.6668 8.67692Z"
        stroke="#015AEB"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00016 6.01025V11.3436M10.6668 8.67692H5.3335"
        stroke="#015AEB"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
