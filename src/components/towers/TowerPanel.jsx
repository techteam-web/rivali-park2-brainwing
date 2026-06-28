import { forwardRef } from 'react'
import FeatureIcon from './FeatureIcon'

const ArrowRight = () => (
  <svg width="22" height="19" viewBox="0 0 22 19" fill="none" aria-hidden="true" className="lg:w-3 lg:h-3.5 2xl:w-3.5 2xl:h-4 3xl:w-4 3xl:h-4 4xl:w-5 4xl:h-5 5xl:w-8 5xl:h-8">
    <path
      d="M0 9.21327H19.5595M19.5595 9.21327L10.7437 1.07129M19.5595 9.21327L10.7437 17.3171"
      stroke="white"
      strokeWidth="2.91667"
    />
  </svg>
)

const StatCard = ({ label, value, accent, valueClassName = '' }) => (
  <div
    data-stat-card
    className="w-fit shrink-0 p-6 md:p-5 lg:p-7 xl:p-9 2xl:p-9 3xl:p-12 4xl:p-15 5xl:p-23 rounded-md"
    style={{ backgroundColor: `${accent}0A` }}
  >
    <p className="font-sans font-medium text-[15px] md:text-[14px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px] 3xl:text-[25px] 4xl:text-[33px] 5xl:text-[50px] tracking-[2px] uppercase text-on-light-grey mb-2 lg:mb-2.5 xl:mb-3 3xl:mb-4 4xl:mb-5 5xl:mb-7">
      {label}
    </p>
    <p
      data-reveal
      className={`font-sans font-medium text-[26px] md:text-[22px] lg:text-[24px] xl:text-[28px] whitespace-nowrap 2xl:text-[30px] 3xl:text-[37px] 4xl:text-[50px] 5xl:text-[74px] leading-tight text-on-light-black ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const TowerPanel = forwardRef(({ tower, index, isActive, onCta }, ref) => {
  const { name, tagline, accent, possession, carpetArea, features } = tower

  // Panel 0 owns the visible static UI (CTA, stat cards, feature icons) per the
  // visibility:hidden rule in index.css, so its text-col must always accept
  // pointer events. Other panels only need pointer events when they're the
  // active tower so their data-reveal text can be selected/hovered.
  const allowEvents = isActive || index === 0

  return (
    <div ref={ref} className="absolute inset-0 z-30 pointer-events-none" data-tower-id={tower.id}>
      <div className="grid grid-cols-12 gap-0 items-stretch h-full">
        {/* Left column — text content, ~5/12 ≈ 42% */}
        <div
          data-text-col
          className={`col-span-12 md:col-span-5 flex flex-col justify-start md:justify-center-safe gap-6 md:gap-3 xl:gap-4 2xl:gap-5 3xl:gap-7 4xl:gap-9 5xl:gap-14 px-12 md:pl-11 md:pr-1 lg:pl-15 lg:pr-1 xl:pl-20 xl:pr-1 2xl:pl-22 2xl:pr-1 3xl:pl-28 3xl:pr-2 4xl:pl-38 4xl:pr-3 5xl:pl-56 5xl:pr-4 pt-24 md:pt-0 ${allowEvents ? 'pointer-events-auto' : ''}`}
        >
          <div>
            <h2
              data-reveal
              className="font-sans font-medium text-[44px] md:text-[36px] lg:text-[38px] xl:text-[40px] 2xl:text-[45px] 3xl:text-[55px] 4xl:text-[73px] 5xl:text-[110px] leading-none -tracking-[1px] text-on-light-black"
            >
              {name}
            </h2>
            <p
              data-reveal
              className="font-script text-[26px] md:text-[18px] lg:text-[16px] xl:text-[23px] 2xl:text-[28px] 3xl:text-[32px] 4xl:text-[43px] 5xl:text-[64px] mt-3.5 md:mt-1.5 xl:mt-2 2xl:mt-2.5 3xl:mt-3.5 4xl:mt-4.5 5xl:mt-7 tracking-wider"
              style={{ color: accent }}
            >
              {tagline}
            </p>
          </div>

          <div className="flex gap-4 md:gap-4 lg:gap-5 xl:gap-5 2xl:gap-6 3xl:gap-6 4xl:gap-8 5xl:gap-12">
            <StatCard label="POSSESSION" value={possession} accent={accent} />
            <StatCard
              label="CARPET AREA"
              value={carpetArea}
              accent={accent}
            />
          </div>

          <ul className="space-y-5 md:space-y-2 xl:space-y-5 2xl:space-y-6 3xl:space-y-5 4xl:space-y-7 5xl:space-y-10 mt-3 md:mt-1 xl:mt-2 2xl:mt-3 3xl:mt-4 4xl:mt-5 5xl:mt-8">
            {features.map((f, i) => (
              <li
                key={i}
                className="font-sans font-medium flex items-center gap-3 leading-none text-[14px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[15px] 4xl:text-[20px] 5xl:text-[30px] tracking-[1.6px] uppercase text-on-light-grey"
              >
                <span data-feature-icon style={{ color: accent }}>
                  <FeatureIcon name={f.icon} className="w-5 h-5 lg:w-4 lg:h-4 3xl:w-5 3xl:h-5 4xl:w-7 4xl:h-7 5xl:w-10 5xl:h-10" />
                </span>
                <span data-reveal>{f.text}</span>
              </li>
            ))}
          </ul>

          <button
            data-cta-button
            type="button"
            onClick={onCta}
            className="font-sans cursor-pointer self-start inline-flex items-center gap-3 lg:gap-2 2xl:gap-3 4xl:gap-4 5xl:gap-6 px-6 md:px-4 xl:px-5 3xl:px-6 4xl:px-8 5xl:px-12 py-3.5 md:py-2 xl:py-2.5 2xl:py-3 3xl:py-3.5 4xl:py-5 5xl:py-7 mt-4 md:mt-1 lg:mt-4 xl:mt-6 2xl:mt-6 3xl:mt-8 4xl:mt-11 5xl:mt-16 text-[14px] md:text-[12px] xl:text-[13px] 2xl:text-[14px] 3xl:text-[15px] 4xl:text-[20px] 5xl:text-[30px] tracking-[2px] uppercase text-white"
            style={{ backgroundColor: accent }}
          >
            <span data-reveal>Plans</span>
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
})

TowerPanel.displayName = 'TowerPanel'

export default TowerPanel
