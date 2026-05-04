import { forwardRef } from 'react'
import TowerImageStage from './TowerImageStage'
import FeatureIcon from './FeatureIcon'

const ArrowRight = () => (
  <svg width="22" height="19" viewBox="0 0 22 19" fill="none" aria-hidden="true">
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
    className="flex-1 px-6 py-5 rounded-md"
    style={{ backgroundColor: `${accent}0A` }}
  >
    <p className="font-sans font-medium text-[15px] lg:text-[17px] 3xl:text-[19px] tracking-[2px] uppercase text-on-light-grey mb-1">
      {label}
    </p>
    <p
      data-reveal
      className={`font-sans font-medium text-[26px] lg:text-[30px] 3xl:text-[36px] leading-tight text-on-light-black ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const TowerPanel = forwardRef(({ tower }, ref) => {
  const { name, tagline, accent, possession, carpetArea, features } = tower

  return (
    <div ref={ref} className="absolute inset-0" data-tower-id={tower.id}>
      <div className="grid grid-cols-12 gap-0 items-stretch h-full">
        {/* Left column — text content, ~5/12 ≈ 42% */}
        <div
          data-text-col
          className="col-span-12 lg:col-span-5 flex flex-col justify-start gap-6 lg:gap-7 px-12 lg:px-20 3xl:px-28 pt-24 lg:pt-28 3xl:pt-36"
        >
          <div>
            <h2
              data-reveal
              className="font-sans font-medium text-[44px] lg:text-[60px] 3xl:text-[80px] leading-none -tracking-[1px] text-on-light-black"
            >
              {name}
            </h2>
            <p
              data-reveal
              className="font-script text-[26px] lg:text-[30px] 3xl:text-[36px] mt-3.5 tracking-wider"
              style={{ color: accent }}
            >
              {tagline}
            </p>
          </div>

          <div className="flex gap-4">
            <StatCard label="POSSESSION" value={possession} accent={accent} />
            <StatCard
              label="CARPET AREA"
              value={carpetArea}
              accent={accent}
              valueClassName="whitespace-nowrap"
            />
          </div>

          <ul className="space-y-5 mt-3 lg:mt-4">
            {features.map((f, i) => (
              <li
                key={i}
                className="font-sans font-medium flex items-center gap-3 leading-none text-[14px] lg:text-[15px] 3xl:text-[17px] tracking-[1.6px] uppercase text-on-light-grey"
              >
                <span data-feature-icon style={{ color: accent }}>
                  <FeatureIcon name={f.icon} className="w-5 h-5" />
                </span>
                <span data-reveal>{f.text}</span>
              </li>
            ))}
          </ul>

          <button
            data-cta-button
            type="button"
            onClick={() => {}}
            className="font-sans self-start inline-flex items-center gap-3 px-6 py-3.5 mt-4 lg:mt-6 3xl:mt-8 text-[14px] 3xl:text-[15px] tracking-[2px] uppercase text-white"
            style={{ backgroundColor: accent }}
          >
            {/* TODO: route the construction-update CTA */}
            <span data-reveal>Construction Update</span>
            <ArrowRight />
          </button>
        </div>

        {/* Right column — image stage, ~7/12 ≈ 58%, touches right viewport edge */}
        <div
          data-image-stage
          className="col-span-12 lg:col-span-7 h-full"
        >
          <div className="relative w-full h-full min-h-[460px]">
            <TowerImageStage tower={tower} />
          </div>
        </div>
      </div>
    </div>
  )
})

TowerPanel.displayName = 'TowerPanel'

export default TowerPanel
