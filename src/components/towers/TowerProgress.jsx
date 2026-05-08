import { forwardRef } from 'react'

const TowerProgress = forwardRef(({ initialAccent, className = '' }, ref) => (
  <svg
    width="215"
    height="18"
    viewBox="0 0 215 18"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <mask
      id="towerProgressMask"
      style={{ maskType: 'alpha' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="4"
      width="215"
      height="10"
    >
      <path
        d="M0.198427 8.45599L17.1236 6.76912C26.1797 5.86654 35.3219 6.42116 44.2025 8.41189L45.3531 8.66982C55.8824 11.0301 66.7821 11.2209 77.3876 9.23031C87.0009 7.42598 96.8647 7.41232 106.483 9.19001L107.607 9.3977C117.432 11.2136 127.499 11.2951 137.352 9.63834L137.765 9.5689C147.892 7.86624 158.238 7.94994 168.336 9.81622L170.531 10.2219C179.205 11.8252 188.053 12.2805 196.847 11.5763L214.191 10.1872"
        stroke="white"
        strokeWidth="4"
      />
    </mask>
    <g mask="url(#towerProgressMask)">
      <rect
        x="0.427246"
        y="-19.7891"
        width="213"
        height="56.5698"
        transform="rotate(0.463512 0.427246 -19.7891)"
        fill="#ffffff"
        opacity="0.6"
      />
      <rect
        ref={ref}
        x="1.73389"
        y="-19.999"
        width="47.4051"
        height="57"
        transform="rotate(0.463512 1.73389 -19.999)"
        fill={initialAccent}
      />
    </g>
  </svg>
))

TowerProgress.displayName = 'TowerProgress'

export default TowerProgress
