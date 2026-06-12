export function SvgDot({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      width="1em"
      height="1em"
      viewBox="0 0 48 49"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <foreignObject x="-4" y="-3.8186" width="56" height="56">
        <div
          style={{
            clipPath: 'url(#bgblur_0_207_5347_clip_path)',
            height: '100%',
            width: '100%',
          }}
        ></div>
      </foreignObject>
      <circle
        data-figma-bg-blur-radius="4"
        cx="24"
        cy="24.1814"
        r="24"
        fillOpacity="0.1"
        className="fill-current"
      />
      <circle
        opacity="0.2"
        cx="23.9999"
        cy="24.1815"
        r="20.9403"
        className="fill-current"
      />
      <circle
        opacity="0.5"
        cx="23.9997"
        cy="24.1816"
        r="17.1183"
        className="fill-current"
      />
      <g filter="url(#filter1_i_207_5347)">
        <circle
          cx="23.9996"
          cy="24.182"
          r="12.5221"
          className="fill-current transition-all group-hover:fill-black"
        />
      </g>
      <defs>
        <clipPath
          id="bgblur_0_207_5347_clip_path"
          transform="translate(4 3.8186)"
        >
          <circle cx="24" cy="24.1814" r="24" />
        </clipPath>
        <filter
          id="filter1_i_207_5347"
          x="11.4775"
          y="11.6599"
          width="25.0444"
          height="29.0442"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_207_5347"
          />
        </filter>
      </defs>
    </svg>
  )
}
