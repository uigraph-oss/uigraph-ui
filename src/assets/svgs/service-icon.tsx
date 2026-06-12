import { cn } from '@/lib/utils'

export function ServiceIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 25"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M3 7.18164C3 5.32574 3 4.39779 3.48886 3.90893C3.97772 3.42007 4.90567 3.42007 6.76157 3.42007H17.2384C19.0943 3.42007 20.0223 3.42007 20.5111 3.90893C21 4.39779 21 5.32574 21 7.18164V17.1816C21 19.0375 21 19.9655 20.5111 20.4543C20.0223 20.9432 19.0943 20.9432 17.2384 20.9432H6.76157C4.90567 20.9432 3.97772 20.9432 3.48886 20.4543C3 19.9655 3 19.0375 3 17.1816V7.18164Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.42007V20.9432"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 3.42007V20.9432"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 12.1816H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 8.18164H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16.1816H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
