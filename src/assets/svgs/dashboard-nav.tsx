import { cn } from '@/lib/utils'

export function AccountSettingsIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M14.2115 5.26125L13.8824 4.69019C13.6336 4.2583 13.5092 4.04236 13.2974 3.95625C13.0857 3.87014 12.8462 3.93809 12.3674 4.07398L11.5539 4.30311C11.2482 4.37362 10.9274 4.33362 10.6482 4.19019L10.4236 4.06061C10.1842 3.90728 10.0001 3.68121 9.89817 3.41549L9.67557 2.75057C9.52917 2.31055 9.45597 2.09055 9.2817 1.96471C9.1075 1.83887 8.87604 1.83887 8.4131 1.83887H7.6699C7.20704 1.83887 6.97557 1.83887 6.8013 1.96471C6.62707 2.09055 6.55388 2.31055 6.4075 2.75057L6.18486 3.41549C6.08294 3.68121 5.8988 3.90728 5.65942 4.06061L5.43483 4.19019C5.15566 4.33362 4.8349 4.37362 4.52916 4.30311L3.71567 4.07398C3.23678 3.93809 2.99734 3.87014 2.78562 3.95625C2.5739 4.04236 2.44947 4.2583 2.2006 4.69019L1.87155 5.26125C1.63828 5.66609 1.52164 5.86851 1.54428 6.08399C1.56691 6.29947 1.72306 6.47311 2.03534 6.82041L2.7227 7.58886C2.8907 7.80153 3.00998 8.17219 3.00998 8.50546C3.00998 8.83886 2.89074 9.20939 2.72272 9.42213L2.03534 10.1906C1.72306 10.5379 1.56692 10.7115 1.54428 10.9271C1.52164 11.1425 1.63828 11.3449 1.87155 11.7497L2.2006 12.3208C2.44946 12.7527 2.5739 12.9687 2.78562 13.0547C2.99734 13.1409 3.23678 13.0729 3.71568 12.937L4.52913 12.7079C4.83492 12.6373 5.15575 12.6774 5.43495 12.8209L5.6595 12.9505C5.89884 13.1038 6.08293 13.3298 6.18484 13.5955L6.4075 14.2605C6.55388 14.7005 6.62707 14.9205 6.8013 15.0464C6.97557 15.1722 7.20704 15.1722 7.6699 15.1722H8.4131C8.87604 15.1722 9.1075 15.1722 9.2817 15.0464C9.45597 14.9205 9.52917 14.7005 9.67557 14.2605L9.89824 13.5955C10.0001 13.3298 10.1842 13.1038 10.4236 12.9505L10.6481 12.8209C10.9273 12.6774 11.2481 12.6373 11.5539 12.7079L12.3674 12.937C12.8462 13.0729 13.0857 13.1409 13.2974 13.0547C13.5092 12.9687 13.6336 12.7527 13.8824 12.3208L14.2115 11.7497C14.4448 11.3449 14.5614 11.1425 14.5388 10.9271C14.5161 10.7115 14.36 10.5379 14.0477 10.1906L13.3603 9.42213C13.1923 9.20939 13.073 8.83886 13.073 8.50546C13.073 8.17219 13.1924 7.80153 13.3603 7.58886L14.0477 6.82041C14.36 6.47311 14.5161 6.29947 14.5388 6.08399C14.5614 5.86851 14.4448 5.66609 14.2115 5.26125Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
      <path
        d="M5.6665 11.1667C6.13226 10.3615 7.00279 9.81979 7.99986 9.81979C8.99686 9.81979 9.86739 10.3615 10.3332 11.1667M9.33319 6.83333C9.33319 7.56972 8.73626 8.16665 7.99986 8.16665C7.26346 8.16665 6.66652 7.56972 6.66652 6.83333C6.66652 6.09695 7.26346 5.5 7.99986 5.5C8.73626 5.5 9.33319 6.09695 9.33319 6.83333Z"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function GlobeIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M8.00016 15.1663C11.6821 15.1663 14.6668 12.1816 14.6668 8.49967C14.6668 4.81778 11.6821 1.83301 8.00016 1.83301C4.31826 1.83301 1.3335 4.81778 1.3335 8.49967C1.3335 12.1816 4.31826 15.1663 8.00016 15.1663Z"
        stroke="currentColor"
      />
      <path
        d="M5.3335 8.49967C5.3335 12.4997 8.00016 15.1663 8.00016 15.1663C8.00016 15.1663 10.6668 12.4997 10.6668 8.49967C10.6668 4.49967 8.00016 1.83301 8.00016 1.83301C8.00016 1.83301 5.3335 4.49967 5.3335 8.49967Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path
        d="M14 10.5H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6.5H2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InvoiceIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M2.6665 12.9302V5.86918C2.6665 3.96651 2.6665 3.01517 3.25229 2.42409C3.83808 1.83301 4.78088 1.83301 6.6665 1.83301H9.33317C11.2188 1.83301 12.1616 1.83301 12.7474 2.42409C13.3332 3.01517 13.3332 3.96651 13.3332 5.86918V12.9302C13.3332 13.938 13.3332 14.4419 13.0252 14.6402C12.5219 14.9644 11.7439 14.2846 11.3526 14.0379C11.0292 13.8339 10.8676 13.732 10.6882 13.7261C10.4943 13.7197 10.3298 13.8175 9.98044 14.0379L8.7065 14.8413C8.36284 15.0579 8.19104 15.1663 7.99984 15.1663C7.80864 15.1663 7.63684 15.0579 7.29317 14.8413L6.01926 14.0379C5.69594 13.8339 5.53428 13.732 5.35486 13.7261C5.16098 13.7197 4.99646 13.8175 4.64708 14.0379C4.2558 14.2846 3.47775 14.9644 2.97447 14.6402C2.6665 14.4419 2.6665 13.938 2.6665 12.9302Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.3335 7.83301H5.3335"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3335 5.16699H5.3335"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserGroupIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M10.3332 7.83333C10.3332 6.54467 9.2885 5.5 7.99984 5.5C6.71117 5.5 5.6665 6.54467 5.6665 7.83333C5.6665 9.122 6.71117 10.1667 7.99984 10.1667C9.2885 10.1667 10.3332 9.122 10.3332 7.83333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3218 8.0666C10.5365 8.13167 10.7642 8.16667 11 8.16667C12.2887 8.16667 13.3334 7.122 13.3334 5.83333C13.3334 4.54467 12.2887 3.5 11 3.5C9.79009 3.5 8.79522 4.42093 8.67822 5.60009"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.32164 5.60009C7.20464 4.42093 6.20978 3.5 4.99984 3.5C3.71117 3.5 2.6665 4.54467 2.6665 5.83333C2.6665 7.122 3.71117 8.16667 4.99984 8.16667C5.23571 8.16667 5.4634 8.13167 5.67802 8.0666"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6667 11.5003C14.6667 9.65939 13.0251 8.16699 11 8.16699"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6668 13.5003C11.6668 11.6594 10.0252 10.167 8.00016 10.167C5.97512 10.167 4.3335 11.6594 4.3335 13.5003"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.00016 8.16699C2.97512 8.16699 1.3335 9.65939 1.3335 11.5003"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserListIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M9.33317 6.16634C9.33317 4.32539 7.84077 2.83301 5.99984 2.83301C4.15889 2.83301 2.6665 4.32539 2.6665 6.16634C2.6665 8.00727 4.15889 9.49967 5.99984 9.49967C7.84077 9.49967 9.33317 8.00727 9.33317 6.16634Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6668 14.1667C10.6668 11.5893 8.5775 9.5 6.00016 9.5C3.42284 9.5 1.3335 11.5893 1.3335 14.1667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3335 7.16699H14.6668"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3335 9.16699H14.6668"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3335 11.167H14.6668"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 16 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M11.3332 6.16634C11.3332 4.32539 9.84077 2.83301 7.99984 2.83301C6.15889 2.83301 4.6665 4.32539 4.6665 6.16634C4.6665 8.00727 6.15889 9.49967 7.99984 9.49967C9.84077 9.49967 11.3332 8.00727 11.3332 6.16634Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6668 14.1667C12.6668 11.5893 10.5775 9.5 8.00016 9.5C5.42284 9.5 3.3335 11.5893 3.3335 14.1667"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatBotIcon({
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
        d="M11 8.18164H13C15.8284 8.18164 17.2426 8.18164 18.1213 9.06032C19 9.939 19 11.3532 19 14.1816C19 17.01 19 18.4242 18.1213 19.3029C17.2426 20.1816 15.8284 20.1816 13 20.1816H12C12 20.1816 11.5 22.1816 8 22.1816C8 22.1816 9 21.1729 9 20.1643C7.44655 20.1175 6.51998 19.9442 5.87868 19.3029C5 18.4242 5 17.01 5 14.1816C5 11.3532 5 9.939 5.87868 9.06032C6.75736 8.18164 8.17157 8.18164 11 8.18164Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 11.6816H19.5C20.4346 11.6816 20.9019 11.6816 21.25 11.8826C21.478 12.0142 21.6674 12.2036 21.799 12.4316C22 12.7797 22 13.247 22 14.1816C22 15.1162 22 15.5835 21.799 15.9316C21.6674 16.1596 21.478 16.349 21.25 16.4806C20.9019 16.6816 20.4346 16.6816 19.5 16.6816H19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 11.6816H4.5C3.56538 11.6816 3.09808 11.6816 2.75 11.8826C2.52197 12.0142 2.33261 12.2036 2.20096 12.4316C2 12.7797 2 13.247 2 14.1816C2 15.1162 2 15.5835 2.20096 15.9316C2.33261 16.1596 2.52197 16.349 2.75 16.4806C3.09808 16.6816 3.56538 16.6816 4.5 16.6816H5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 3.68164C13.5 4.51007 12.8284 5.18164 12 5.18164C11.1716 5.18164 10.5 4.51007 10.5 3.68164C10.5 2.85321 11.1716 2.18164 12 2.18164C12.8284 2.18164 13.5 2.85321 13.5 3.68164Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 5.18164V8.18164"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.1816V13.1816M15 12.1816V13.1816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16.6816C10 16.6816 10.6667 17.1816 12 17.1816C13.3333 17.1816 14 16.6816 14 16.6816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HomeIcon({
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
        d="M3 12.1712V14.6816C3 17.9814 3 19.6313 4.02513 20.6565C5.05025 21.6816 6.70017 21.6816 10 21.6816H14C17.2998 21.6816 18.9497 21.6816 19.9749 20.6565C21 19.6313 21 17.9814 21 14.6816V12.1712C21 10.4899 21 9.64937 20.6441 8.92169C20.2882 8.19401 19.6247 7.67792 18.2976 6.64575L16.2976 5.09019C14.2331 3.48449 13.2009 2.68164 12 2.68164C10.7991 2.68164 9.76689 3.48449 7.70242 5.09019L5.70241 6.64575C4.37533 7.67792 3.71179 8.19401 3.3559 8.92169C3 9.64937 3 10.4899 3 12.1712Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0001 17.1816C14.2006 17.804 13.1503 18.1816 12.0001 18.1816C10.8498 18.1816 9.79965 17.804 9.00012 17.1816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LibraryIcon({
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
        d="M16.2627 10.6816H7.73725C5.15571 10.6816 3.86494 10.6816 3.27143 11.5342C2.67793 12.3868 3.11904 13.6074 4.00126 16.0486L5.08545 19.0486C5.54545 20.3214 5.77545 20.9579 6.2889 21.3197C6.80235 21.6816 7.47538 21.6816 8.82143 21.6816H15.1786C16.5246 21.6816 17.1976 21.6816 17.7111 21.3197C18.2245 20.9579 18.4545 20.3214 18.9146 19.0486L19.9987 16.0486C20.881 13.6074 21.3221 12.3868 20.7286 11.5342C20.1351 10.6816 18.8443 10.6816 16.2627 10.6816Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <path
        d="M19 8.18164C19 7.7157 19 7.48273 18.9239 7.29896C18.8224 7.05393 18.6277 6.85925 18.3827 6.75776C18.1989 6.68164 17.9659 6.68164 17.5 6.68164H6.5C6.03406 6.68164 5.80109 6.68164 5.61732 6.75776C5.37229 6.85925 5.17761 7.05393 5.07612 7.29896C5 7.48273 5 7.7157 5 8.18164"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 4.18164C16.5 3.7157 16.5 3.48273 16.4239 3.29896C16.3224 3.05393 16.1277 2.85925 15.8827 2.75776C15.6989 2.68164 15.4659 2.68164 15 2.68164H9C8.53406 2.68164 8.30109 2.68164 8.11732 2.75776C7.87229 2.85925 7.67761 3.05393 7.57612 3.29896C7.5 3.48273 7.5 3.7157 7.5 4.18164"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MoreVerticalIcon({
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
        d="M11.9919 12.1816H12.0009"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9843 18.1816H11.9933"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9998 6.18164H12.0088"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotificationIcon({
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
        d="M15.5 18.1816C15.5 20.1146 13.933 21.6816 12 21.6816C10.067 21.6816 8.5 20.1146 8.5 18.1816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2311 18.1816H4.76887C3.79195 18.1816 3 17.3896 3 16.4127C3 15.9436 3.18636 15.4937 3.51809 15.1619L4.12132 14.5587C4.68393 13.9961 5 13.233 5 12.4374V9.68164C5 5.81565 8.13401 2.68164 12 2.68164C15.866 2.68164 19 5.81564 19 9.68164V12.4374C19 13.233 19.3161 13.9961 19.8787 14.5587L20.4819 15.1619C20.8136 15.4937 21 15.9436 21 16.4127C21 17.3896 20.208 18.1816 19.2311 18.1816Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SearchIcon({
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
        d="M17 17.1816L21 21.1816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 11.1816C19 6.76336 15.4183 3.18164 11 3.18164C6.58172 3.18164 3 6.76336 3 11.1816C3 15.5999 6.58172 19.1816 11 19.1816C15.4183 19.1816 19 15.5999 19 11.1816Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AddTaskIcon({
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
        d="M18 15.1816V22.1816M21.5 18.6816H14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 16.1816H11M7 11.1816H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 3.68164C4.9442 3.72831 4.01661 3.90148 3.37477 4.54391C2.49609 5.42341 2.49609 6.83894 2.49609 9.67V16.176C2.49609 19.0071 2.49609 20.4226 3.37477 21.3021C4.25345 22.1816 5.66767 22.1816 8.49609 22.1816H11.5M15.4922 3.68164C17.048 3.72831 17.9756 3.90148 18.6174 4.54392C19.4961 5.42341 19.4961 6.83894 19.4961 9.67V12.1816"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.49609 3.93164C6.49609 2.96514 7.2796 2.18164 8.24609 2.18164H13.7461C14.7126 2.18164 15.4961 2.96514 15.4961 3.93164C15.4961 4.89814 14.7126 5.68164 13.7461 5.68164H8.24609C7.2796 5.68164 6.49609 4.89814 6.49609 3.93164Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SettingsIcon({
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
        d="M21.3175 7.32303L20.8239 6.46643C20.4506 5.8186 20.264 5.49469 19.9464 5.36552C19.6288 5.23636 19.2696 5.33828 18.5513 5.54212L17.3311 5.88582C16.8725 5.99158 16.3913 5.93158 15.9726 5.71643L15.6357 5.52206C15.2766 5.29207 15.0004 4.95297 14.8475 4.55438L14.5136 3.557C14.294 2.89698 14.1842 2.56697 13.9228 2.37821C13.6615 2.18945 13.3143 2.18945 12.6199 2.18945H11.5051C10.8108 2.18945 10.4636 2.18945 10.2022 2.37821C9.94085 2.56697 9.83106 2.89698 9.61149 3.557L9.27753 4.55438C9.12465 4.95297 8.84845 5.29207 8.48937 5.52206L8.15249 5.71643C7.73374 5.93158 7.25259 5.99158 6.79398 5.88582L5.57375 5.54212C4.85541 5.33828 4.49625 5.23636 4.17867 5.36552C3.86109 5.49469 3.67445 5.8186 3.30115 6.46643L2.80757 7.32303C2.45766 7.93028 2.2827 8.23391 2.31666 8.55713C2.35061 8.88035 2.58483 9.14082 3.05326 9.66176L4.0843 10.8144C4.3363 11.1334 4.51521 11.6894 4.51521 12.1893C4.51521 12.6894 4.33636 13.2452 4.08433 13.5643L3.05326 14.717C2.58483 15.238 2.35062 15.4984 2.31666 15.8217C2.2827 16.1449 2.45766 16.4485 2.80757 17.0557L3.30114 17.9123C3.67443 18.5601 3.86109 18.8841 4.17867 19.0132C4.49625 19.1424 4.85542 19.0405 5.57377 18.8366L6.79394 18.4929C7.25263 18.3871 7.73387 18.4472 8.15267 18.6624L8.4895 18.8568C8.84851 19.0868 9.12464 19.4258 9.2775 19.8244L9.61149 20.8219C9.83106 21.4819 9.94085 21.8119 10.2022 22.0007C10.4636 22.1894 10.8108 22.1894 11.5051 22.1894H12.6199C13.3143 22.1894 13.6615 22.1894 13.9228 22.0007C14.1842 21.8119 14.294 21.4819 14.5136 20.8219L14.8476 19.8244C15.0004 19.4258 15.2765 19.0868 15.6356 18.8568L15.9724 18.6624C16.3912 18.4472 16.8724 18.3871 17.3311 18.4929L18.5513 18.8366C19.2696 19.0405 19.6288 19.1424 19.9464 19.0132C20.264 18.8841 20.4506 18.5601 20.8239 17.9123L21.3175 17.0557C21.6674 16.4485 21.8423 16.1449 21.8084 15.8217C21.7744 15.4984 21.5402 15.238 21.0718 14.717L20.0407 13.5643C19.7887 13.2452 19.6098 12.6894 19.6098 12.1893C19.6098 11.6894 19.7888 11.1334 20.0407 10.8144L21.0718 9.66176C21.5402 9.14082 21.7744 8.88035 21.8084 8.55713C21.8423 8.23391 21.6674 7.93028 21.3175 7.32303Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5195 12.1816C15.5195 14.1146 13.9525 15.6816 12.0195 15.6816C10.0865 15.6816 8.51953 14.1146 8.51953 12.1816C8.51953 10.2486 10.0865 8.68164 12.0195 8.68164C13.9525 8.68164 15.5195 10.2486 15.5195 12.1816Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
