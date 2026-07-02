import { cn } from '@/lib/utils'

export function SaveIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 17 18"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.44946 5.02652C2.50253 4.57292 2.72026 4.15458 3.06134 3.85087C3.40241 3.54716 3.8431 3.37922 4.2998 3.37891H11.4163C11.5369 3.37881 11.6535 3.4226 11.7442 3.50213L13.5727 5.108C13.9841 5.46906 14.2113 5.99574 14.1914 6.54229L13.9635 12.885C13.9465 13.3565 13.7473 13.803 13.4078 14.1306C13.0682 14.4581 12.6148 14.6412 12.143 14.6412H4.18717C3.76129 14.6416 3.34991 14.4865 3.03022 14.2051C2.71054 13.9237 2.50451 13.5353 2.45079 13.1129C2.12139 10.5436 2.10716 7.94372 2.40839 5.37101L2.44946 5.02652ZM4.30046 4.37264C3.85858 4.37264 3.48692 4.70388 3.43591 5.14179L3.39616 5.48628C3.1045 7.97884 3.11785 10.4977 3.43591 12.987C3.48493 13.3646 3.8069 13.6475 4.18717 13.6475H4.60918V10.8319C4.60918 10.1919 5.12857 9.67255 5.76853 9.67255H10.406C11.0459 9.67255 11.5653 10.1919 11.5653 10.8319V13.6475H12.1437C12.3582 13.6476 12.5645 13.5645 12.7189 13.4156C12.8734 13.2667 12.9641 13.0636 12.9718 12.8492L13.199 6.50718C13.2035 6.38438 13.1807 6.26212 13.1321 6.14925C13.0835 6.03638 13.0104 5.93574 12.9181 5.85463L11.2341 4.37595V5.92949C11.2341 6.23697 11.1119 6.53186 10.8945 6.74928C10.6771 6.9667 10.3822 7.08885 10.0747 7.08885H6.09978C5.7923 7.08885 5.49741 6.9667 5.27999 6.74928C5.06257 6.53186 4.94042 6.23697 4.94042 5.92949V4.37264H4.30046ZM5.93416 4.37264V5.92949C5.93416 6.02091 6.00836 6.09511 6.09978 6.09511H10.0747C10.1186 6.09511 10.1608 6.07766 10.1918 6.0466C10.2229 6.01554 10.2403 5.97342 10.2403 5.92949V4.37264H5.93416ZM10.5716 13.6475H5.60291V10.8319C5.60291 10.788 5.62036 10.7459 5.65142 10.7148C5.68248 10.6837 5.72461 10.6663 5.76853 10.6663H10.406C10.4499 10.6663 10.492 10.6837 10.5231 10.7148C10.5541 10.7459 10.5716 10.788 10.5716 10.8319V13.6475Z"
        fill="white"
      />
    </svg>
  )
}

export function UploadTopIcon({
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
        d="M3 14.1597L3.23384 14.8223C4.144 17.401 4.59907 18.6904 5.63742 19.4251C6.67576 20.1597 8.04309 20.1597 10.7777 20.1597H13.2222C15.9569 20.1597 17.3242 20.1597 18.3625 19.4251C19.4009 18.6904 19.856 17.401 20.7661 14.8223L21 14.1597"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 4.15967V14.1597M12 4.15967C11.2997 4.15967 9.99153 6.15397 9.5 6.65967M12 4.15967C12.7002 4.15967 14.0084 6.15397 14.5 6.65967"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M9.00013 2.82727V13.536M14.3545 8.18164H3.64575"
        stroke="#6B7480"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MinusIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 18 17"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('custom-icon-text-size', className)}
      {...props}
    >
      <path
        d="M14.3545 8.18164H3.64575"
        stroke="#6B7480"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CirclePlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 17 17" fill="none" {...props}>
      <path
        d="M15.386 8.532A6.693 6.693 0 102 8.532a6.693 6.693 0 0013.386 0zM8.693 5.855v5.354m2.677-2.677H6.015"
        stroke="#fff"
        strokeWidth={1.004}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 17 17"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.16797 7.83842C2.16797 4.84108 2.16797 3.34241 3.09912 2.41125C4.03028 1.4801 5.52895 1.4801 8.52629 1.4801C11.5236 1.4801 13.0223 1.4801 13.9535 2.41125C14.8846 3.34241 14.8846 4.84108 14.8846 7.83842C14.8846 10.8357 14.8846 12.3344 13.9535 13.2656C13.0223 14.1967 11.5236 14.1967 8.52629 14.1967C5.52895 14.1967 4.03028 14.1967 3.09912 13.2656C2.16797 12.3344 2.16797 10.8357 2.16797 7.83842Z"
        stroke="currentColor"
        strokeWidth="1.00395"
      />
      <path
        d="M7.85645 4.4928H11.8722"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M5.17969 4.4928H5.84898"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M5.17969 7.8385H5.84898"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M5.17969 11.1852H5.84898"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M7.85645 7.8385H11.8722"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
      <path
        d="M7.85645 11.1852H11.8722"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CommentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.4074 7.54908C14.4074 11.0851 11.4104 13.952 7.71445 13.952C7.27988 13.9526 6.84651 13.9124 6.41963 13.8323C6.11238 13.7745 5.95874 13.7457 5.85149 13.7621C5.74422 13.7785 5.59223 13.8593 5.28825 14.021C4.4283 14.4783 3.42557 14.6398 2.46122 14.4604C2.82774 14.0096 3.07807 13.4687 3.18852 12.8888C3.25545 12.5341 3.08961 12.1895 2.84123 11.9373C1.71309 10.7917 1.02148 9.24802 1.02148 7.54908C1.02148 4.0131 4.01845 1.14612 7.71445 1.14612C11.4104 1.14612 14.4074 4.0131 14.4074 7.54908Z"
        stroke="currentColor"
        strokeWidth="1.00395"
        strokeLinejoin="round"
      />
      <path
        d="M7.71226 7.8385H7.71829M10.3864 7.8385H10.3925M5.03809 7.8385H5.04409"
        stroke="currentColor"
        strokeWidth="1.33859"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
