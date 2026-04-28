import RaggedyDivider from './RaggedyDivider'

const TimelineCard = ({ year, caption, image, badge, badgeClass = 'h-[55%]', contain = false }) => (
  <article className="w-full max-w-[260px] mx-auto bg-white border border-on-light-stroke">
    <div className="relative aspect-[260/180] overflow-hidden bg-on-light-highlight-brown">
      <img
        src={image}
        alt=""
        className={`absolute inset-0 w-full h-full ${contain ? 'object-contain p-3' : 'object-cover'}`}
      />
      {badge && (
        <img
          src={badge}
          alt=""
          aria-hidden="true"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-auto ${badgeClass}`}
        />
      )}
    </div>
    <div className="px-4 py-4">
      <p className="font-medium text-[14px] text-on-light-black mb-1">{year}</p>
      <p className="text-[12.5px] text-on-light-grey leading-[1.55]">{caption}</p>
    </div>
  </article>
)

const dotPositions = [0.166, 0.333, 0.5, 0.666, 0.833]

const JourneyThroughTime = () => {
  return (
    <>
      <RaggedyDivider />
      <section className="bg-pastel-brown-bg pt-2 pb-24 lg:pb-32 px-6 lg:px-10">
        <div className="text-center mb-14 lg:mb-20">
          <h2 className="font-normal text-[40px] lg:text-[52px] 3xl:text-[64px] 4xl:text-5xl leading-[1.2] -tracking-[1px] text-on-light-black">
            A journey through time
          </h2>
          <img
            src="/about/shaping-a-legacy.svg"
            alt="shaping a legacy of innovation"
            className="mx-auto mt-3 h-6.5 lg:h-7.5 3xl:h-9 w-auto"
          />
        </div>

        <div className="relative max-w-[1080px] 3xl:max-w-[1200px] mx-auto">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-4 flex justify-center">
              <TimelineCard
                year="2001"
                caption="CCI Projects is formed"
                image="/about/timeline-image-36.png"
                badge="/about/cci-logo.png"
                badgeClass="h-[60%] max-w-[80%]"
              />
            </div>
            <div className="col-span-4 flex justify-center">
              <TimelineCard
                year="2016"
                caption="Completion of  Whitespring"
                image="/about/whitespring.png"
              />
            </div>
            <div className="col-span-4 flex justify-center">
              <TimelineCard
                year="2023"
                caption="Launch of Rivali Park 2"
                image="/about/central-courtyard.jpg"
              />
            </div>
          </div>

          <div className="relative h-10 my-10 lg:my-14">
            <img
              src="/about/about-journey-bar.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-auto"
            />
            {dotPositions.map((pct) => (
              <img
                key={pct}
                src="/about/about-bar-bullet.svg"
                alt=""
                aria-hidden="true"
                className="absolute -translate-x-1/2 -translate-y-1/2 h-8 w-auto"
                style={{ left: `${pct * 100}%`, top: '50%' }}
              />
            ))}
          </div>

          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-4 col-start-3 flex justify-center">
              <TimelineCard
                year="2001 - 2010"
                caption="Factory operations moved from Borivali to Nashik. Master planning of Rivali Park begins"
                image="/about/timeline-image-36.png"
                badge="/about/rivali-park-white.png"
              />
            </div>
            <div className="col-span-4 col-start-7 flex justify-center">
              <TimelineCard
                year="2021"
                caption="Completion of Wintergreen"
                image="/about/rivali-transformation.jpg"
              />
            </div>
          </div>
        </div>
      </section>
      <RaggedyDivider flipped />
    </>
  )
}

export default JourneyThroughTime
