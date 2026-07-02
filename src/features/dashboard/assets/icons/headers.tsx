import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function GridIcon({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 20 21"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M7.5 2.68164H3.33333C2.8731 2.68164 2.5 3.05474 2.5 3.51497V7.68164C2.5 8.14188 2.8731 8.51497 3.33333 8.51497H7.5C7.96024 8.51497 8.33333 8.14188 8.33333 7.68164V3.51497C8.33333 3.05474 7.96024 2.68164 7.5 2.68164Z"
        stroke="#0C0C0C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.6667 2.68164H12.5C12.0398 2.68164 11.6667 3.05474 11.6667 3.51497V7.68164C11.6667 8.14188 12.0398 8.51497 12.5 8.51497H16.6667C17.1269 8.51497 17.5 8.14188 17.5 7.68164V3.51497C17.5 3.05474 17.1269 2.68164 16.6667 2.68164Z"
        stroke="#0C0C0C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11.8483H3.33333C2.8731 11.8483 2.5 12.2214 2.5 12.6816V16.8483C2.5 17.3085 2.8731 17.6816 3.33333 17.6816H7.5C7.96024 17.6816 8.33333 17.3085 8.33333 16.8483V12.6816C8.33333 12.2214 7.96024 11.8483 7.5 11.8483Z"
        stroke="#0C0C0C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6697 14.7543H17.4781M14.5739 11.8501V17.6586"
        stroke="#0C0C0C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotificationQuickIcon({
  className,
  ...props
}: ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 20 21"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M8.58333 17.6817C8.72282 17.9354 8.92787 18.147 9.17708 18.2944C9.42628 18.4418 9.71048 18.5195 10 18.5195C10.2895 18.5195 10.5737 18.4418 10.8229 18.2944C11.0721 18.147 11.2772 17.9354 11.4167 17.6817M5 6.84839C5 5.52231 5.52678 4.25054 6.46447 3.31285C7.40215 2.37517 8.67392 1.84839 10 1.84839C11.3261 1.84839 12.5979 2.37517 13.5355 3.31285C14.4732 4.25054 15 5.52231 15 6.84839C15 12.6817 17.5 14.3484 17.5 14.3484H2.5C2.5 14.3484 5 12.6817 5 6.84839Z"
        stroke="#0C0C0C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="14.9567"
        cy="5.59949"
        r="2.40759"
        fill="#EA5455"
        stroke="#292928"
      />
    </svg>
  )
}
