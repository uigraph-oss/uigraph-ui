import { cn } from '@/lib/utils'
import styles from './styles.module.css'

export function HandIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M6.25055 6.4129L4.63222 8.1547C4.41645 8.37684 4.03136 8.95658 3.98489 9.4876C3.93602 10.046 4.43914 10.8471 4.63222 11.1538C5.13549 11.953 5.33814 12.3966 5.92688 13.1531C6.24661 13.5639 7.11028 14.3828 8.51622 14.486C9.56574 14.5629 10.6104 14.5558 11.1055 14.486C11.4455 14.438 12.2707 14.286 13.0475 13.4863C13.8243 12.6866 14.0185 11.3759 14.0185 10.8205V5.48894C14.0185 5.15571 13.8243 4.48927 13.0475 4.48927C12.2707 4.48927 12.0765 5.15571 12.0765 5.48894V7.82152M6.25055 9.4876V4.15605C6.25055 3.82282 6.44474 3.15638 7.22154 3.15638C7.99832 3.15638 8.19255 3.82282 8.19255 4.15605M8.19255 4.15605V7.15504M8.19255 4.15605V2.82315C8.19255 2.48993 8.38671 1.82349 9.16356 1.82349C9.94035 1.82349 10.1345 2.48993 10.1345 2.82315V4.15605M10.1345 4.15605V7.15504M10.1345 4.15605C10.1345 3.82282 10.3287 3.15638 11.1055 3.15638C11.8823 3.15638 12.0765 3.82282 12.0765 4.15605V5.82216"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CursorIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M7.52938 3.24873L11.5676 4.82891C13.8968 5.74032 15.0614 6.19602 15.0227 6.91887C14.9841 7.64177 13.7688 7.97321 11.338 8.63615C10.6143 8.83352 10.2524 8.93225 10.0015 9.1831C9.75056 9.43402 9.65191 9.79591 9.45447 10.5197C8.7916 12.9504 8.46009 14.1657 7.73725 14.2044C7.01438 14.243 6.55868 13.0784 5.64727 10.7493L4.06709 6.71102C3.11289 4.27249 2.63579 3.05324 3.25369 2.43533C3.8716 1.81743 5.09086 2.29453 7.52938 3.24873Z"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ZoomInIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M12.3464 11.5281L15.0236 14.2053"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6851 7.51233C13.6851 4.55519 11.2878 2.15796 8.33069 2.15796C5.37355 2.15796 2.97632 4.55519 2.97632 7.51233C2.97632 10.4695 5.37355 12.8667 8.33069 12.8667C11.2878 12.8667 13.6851 10.4695 13.6851 7.51233Z"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.98816 7.51246H10.6732M8.3307 5.16992V9.855"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ZoomOutIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M12.3464 11.5281L15.0236 14.2053"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.6851 7.51233C13.6851 4.55519 11.2878 2.15796 8.33069 2.15796C5.37355 2.15796 2.97632 4.55519 2.97632 7.51233C2.97632 10.4695 5.37355 12.8667 8.33069 12.8667C11.2878 12.8667 13.6851 10.4695 13.6851 7.51233Z"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.98816 7.51246H10.6732"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FullScreenIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M11.3425 14.2053C12.2766 14.2053 12.7436 14.2053 13.1236 14.09C13.9792 13.8305 14.6489 13.1609 14.9084 12.3052C15.0237 11.9252 15.0237 11.4582 15.0237 10.5242M15.0237 5.83909C15.0237 4.90505 15.0237 4.43803 14.9084 4.058C14.6489 3.20237 13.9792 2.53279 13.1236 2.27324C12.7436 2.15796 12.2766 2.15796 11.3425 2.15796M6.65745 14.2053C5.72341 14.2053 5.25639 14.2053 4.87636 14.09C4.02073 13.8305 3.35115 13.1609 3.0916 12.3052C2.97632 11.9252 2.97632 11.4582 2.97632 10.5242M2.97632 5.83909C2.97632 4.90505 2.97632 4.43803 3.0916 4.058C3.35115 3.20237 4.02073 2.53279 4.87636 2.27324C5.25639 2.15796 5.72341 2.15796 6.65745 2.15796"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function View3DIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M8.99993 7.84697C9.33156 7.84697 9.63991 7.71412 10.2565 7.44841L10.7015 7.25665C11.7981 6.78414 12.3464 6.54788 12.3464 6.17373C12.3464 5.79958 11.7981 5.56332 10.7015 5.09079L10.2565 4.89905C9.63991 4.63334 9.33156 4.50049 8.99993 4.50049C8.66829 4.50049 8.35995 4.63334 7.74332 4.89905L7.29836 5.09079C6.20175 5.56332 5.65344 5.79958 5.65344 6.17373C5.65344 6.54788 6.20175 6.78414 7.29836 7.25665L7.74332 7.44841C8.35995 7.71412 8.66829 7.84697 8.99993 7.84697ZM8.99993 7.84697V11.8628"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinejoin="round"
      />
      <path
        d="M12.3464 6.17383V10.1896C12.3464 10.5637 11.7981 10.8 10.7015 11.2725L10.2565 11.4643C9.63991 11.73 9.33156 11.8629 8.99993 11.8629C8.66829 11.8629 8.35995 11.73 7.74332 11.4643L7.29836 11.2725C6.20175 10.8 5.65344 10.5637 5.65344 10.1896V6.17383"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinejoin="round"
      />
      <path
        d="M7.08858 1.82349C5.31025 1.86415 4.27153 2.03402 3.56184 2.74372C2.85214 3.45342 2.68226 4.49213 2.6416 6.27047M10.9112 1.82349C12.6896 1.86415 13.7283 2.03402 14.438 2.74372C15.1477 3.45342 15.3175 4.49213 15.3582 6.27047M10.9112 14.5401C12.6896 14.4994 13.7283 14.3296 14.438 13.6199C15.1477 12.9102 15.3175 11.8715 15.3582 10.0931M7.08858 14.5401C5.31025 14.4994 4.27153 14.3296 3.56184 13.6199C2.85214 12.9102 2.68226 11.8715 2.6416 10.0931"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GridTableIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M9.66929 2.15796H8.33069C5.80661 2.15796 4.54458 2.15796 3.76045 2.94209C2.97632 3.72622 2.97632 4.98825 2.97632 7.51233V8.85093C2.97632 11.375 2.97632 12.6371 3.76045 13.4212C4.54458 14.2053 5.80661 14.2053 8.33069 14.2053H9.66929C12.1933 14.2053 13.4554 14.2053 14.2395 13.4212C15.0237 12.6371 15.0237 11.375 15.0237 8.85093V7.51233C15.0237 4.98825 15.0237 3.72622 14.2395 2.94209C13.4554 2.15796 12.1933 2.15796 9.66929 2.15796Z"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.99207 2.15796V14.2053"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.0078 2.15796V14.2053"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0236 6.17383H2.97632"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0236 10.1897H2.97632"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EyeIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M15.3877 7.54248C15.5912 7.8278 15.6929 7.9705 15.6929 8.18166C15.6929 8.39282 15.5912 8.53552 15.3877 8.82084C14.4734 10.1029 12.1384 12.8667 8.99998 12.8667C5.8615 12.8667 3.52653 10.1029 2.61223 8.82084C2.40875 8.53552 2.30701 8.39282 2.30701 8.18166C2.30701 7.9705 2.40875 7.8278 2.61223 7.54248C3.52653 6.2604 5.8615 3.49658 8.99998 3.49658C12.1384 3.49658 14.4734 6.2604 15.3877 7.54248Z"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      <path
        d="M11.0078 8.18172C11.0078 7.07276 10.1089 6.17383 8.99996 6.17383C7.891 6.17383 6.99207 7.07276 6.99207 8.18172C6.99207 9.29068 7.891 10.1896 8.99996 10.1896C10.1089 10.1896 11.0078 9.29068 11.0078 8.18172Z"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
    </svg>
  )
}

export function SaveFileIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.25684 4.19815C3.30991 3.74455 3.52763 3.32621 3.86871 3.0225C4.20978 2.71879 4.65048 2.55085 5.10717 2.55054H12.2236C12.3443 2.55044 12.4608 2.59424 12.5516 2.67376L14.38 4.27963C14.7914 4.64069 15.0187 5.16737 14.9988 5.71392L14.7709 12.0566C14.7539 12.5281 14.5547 12.9746 14.2151 13.3022C13.8756 13.6297 13.4222 13.8128 12.9504 13.8129H4.99455C4.56866 13.8132 4.15728 13.6581 3.8376 13.3767C3.51791 13.0953 3.31188 12.707 3.25816 12.2845C2.92877 9.71523 2.91453 7.11535 3.21576 4.54264L3.25684 4.19815ZM5.10783 3.54427C4.66595 3.54427 4.29429 3.87552 4.24328 4.31342L4.20353 4.65792C3.91187 7.15047 3.92522 9.66929 4.24328 12.1586C4.29231 12.5362 4.61428 12.8191 4.99455 12.8191H5.41655V10.0035C5.41655 9.36358 5.93594 8.84418 6.57591 8.84418H11.2133C11.8533 8.84418 12.3727 9.36358 12.3727 10.0035V12.8191H12.951C13.1656 12.8193 13.3718 12.7361 13.5263 12.5872C13.6808 12.4383 13.7714 12.2352 13.7792 12.0208L14.0064 5.67881C14.0109 5.55602 13.9881 5.43375 13.9395 5.32088C13.8909 5.20802 13.8178 5.10738 13.7255 5.02626L12.0414 3.54758V5.10112C12.0414 5.4086 11.9193 5.70349 11.7019 5.92091C11.4845 6.13833 11.1896 6.26048 10.8821 6.26048H6.90715C6.59967 6.26048 6.30479 6.13833 6.08736 5.92091C5.86994 5.70349 5.7478 5.4086 5.7478 5.10112V3.54427H5.10783ZM6.74153 3.54427V5.10112C6.74153 5.19254 6.81573 5.26674 6.90715 5.26674H10.8821C10.926 5.26674 10.9681 5.24929 10.9992 5.21823C11.0303 5.18717 11.0477 5.14505 11.0477 5.10112V3.54427H6.74153ZM11.379 12.8191H6.41029V10.0035C6.41029 9.95962 6.42773 9.91749 6.4588 9.88643C6.48986 9.85537 6.53198 9.83792 6.57591 9.83792H11.2133C11.2573 9.83792 11.2994 9.85537 11.3304 9.88643C11.3615 9.91749 11.379 9.95962 11.379 10.0035V12.8191Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function DownloadIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M2.97656 9.52026L3.13308 9.96374C3.74224 11.6897 4.04682 12.5526 4.74178 13.0444C5.43674 13.536 6.35189 13.536 8.18221 13.536H9.8183C11.6486 13.536 12.5638 13.536 13.2587 13.0444C13.9536 12.5526 14.2582 11.6897 14.8674 9.96374L15.0239 9.52026"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M9.00013 9.52036V2.82739M9.00013 9.52036C8.53149 9.52036 7.65588 8.18558 7.3269 7.84712M9.00013 9.52036C9.46877 9.52036 10.3444 8.18558 10.6734 7.84712"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AutoLayoutIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      {/* top node */}
      <rect
        x="6.5"
        y="1.5"
        width="5"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* bottom-left node */}
      <rect
        x="1.5"
        y="12.5"
        width="5"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* bottom-right node */}
      <rect
        x="11.5"
        y="12.5"
        width="5"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* vertical line from top node down */}
      <path
        d="M9 4.5V8.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* horizontal line */}
      <path
        d="M4 8.5H14"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* line to bottom-left */}
      <path
        d="M4 8.5V12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* line to bottom-right */}
      <path
        d="M14 8.5V12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LayoutLRIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      {/* left node */}
      <rect
        x="1.5"
        y="6.5"
        width="4"
        height="4"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* right-top node */}
      <rect
        x="12.5"
        y="2.5"
        width="4"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* right-bottom node */}
      <rect
        x="12.5"
        y="11.5"
        width="4"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* horizontal trunk */}
      <path
        d="M5.5 8.5H9.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* vertical branch */}
      <path
        d="M9.5 4H9.5V13"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* branch to top */}
      <path
        d="M9.5 4H12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* branch to bottom */}
      <path
        d="M9.5 13H12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LayoutTBIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      {/* top node */}
      <rect
        x="7"
        y="1"
        width="4"
        height="3.5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* bottom-left node */}
      <rect
        x="2"
        y="12.5"
        width="4"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* bottom-right node */}
      <rect
        x="12"
        y="12.5"
        width="4"
        height="3"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      {/* vertical trunk */}
      <path
        d="M9 4.5V8.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* horizontal branch */}
      <path
        d="M4 8.5H14"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* branch to bottom-left */}
      <path
        d="M4 8.5V12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      {/* branch to bottom-right */}
      <path
        d="M14 8.5V12.5"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function UploadIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(styles.icon, className)}
      {...props}
    >
      <path
        d="M2.97632 9.52026L3.13283 9.96374C3.74199 11.6897 4.04657 12.5526 4.74154 13.0444C5.43649 13.536 6.35164 13.536 8.18194 13.536H9.81803C11.6484 13.536 12.5635 13.536 13.2584 13.0444C13.9534 12.5526 14.258 11.6897 14.8671 9.96374L15.0237 9.52026"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M9.00017 2.82739V9.52036M9.00017 2.82739C8.53146 2.82739 7.65588 4.16217 7.3269 4.50063M9.00017 2.82739C9.46881 2.82739 10.3444 4.16217 10.6734 4.50063"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
