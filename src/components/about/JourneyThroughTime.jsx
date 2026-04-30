import RaggedyDivider from "./RaggedyDivider";

const TimelineCard = ({
  year,
  caption,
  image,
  badge,
  badgeClass = "h-[55%]",
  contain = false,
  imageClass = "",
}) => (
  <article className="w-full max-w-[260px] lg:max-w-[200px] mx-auto bg-white border border-on-light-stroke flex flex-col min-h-[290px] lg:min-h-[215px]">
    <div className="relative aspect-[260/180] overflow-hidden bg-on-light-highlight-brown shrink-0">
      <img
        src={image}
        alt=""
        className={`absolute inset-0 w-full h-full ${contain ? "object-contain p-3" : "object-cover"} ${imageClass}`}
      />
      {badge && (
        <img
          src={badge}
          alt=""
          aria-hidden="true"
          className={`absolute left-1/2 top-2/5 -translate-x-1/2 -translate-y-1/2 w-auto ${badgeClass}`}
        />
      )}
    </div>
    <div className="flex-1 px-4 py-4 lg:px-3 lg:py-3">
      <p className="font-medium text-[14px] lg:text-[11px] text-on-light-black mb-1 lg:mb-0">
        {year}
      </p>
      <p className="text-[12.5px] lg:text-[10px] text-on-light-grey leading-[1.55]">
        {caption}
      </p>
    </div>
  </article>
);

const JourneyThroughTime = () => {
  return (
    <>
      <RaggedyDivider />
      <section className="bg-pastel-brown-bg pt-2 pb-24 lg:pb-20 px-6 lg:px-10">
        <div className="text-center mb-14 lg:mb-12">
          <h2 className="font-normal text-[40px] lg:text-[36px] 3xl:text-[64px] 4xl:text-5xl leading-[1.2] -tracking-[1px] text-on-light-black">
            A journey through time
          </h2>
          <img
            src="/about/shaping-a-legacy.svg"
            alt="shaping a legacy of innovation"
            className="mx-auto mt-3 h-6.5 lg:h-7 3xl:h-9 w-auto"
          />
        </div>

        <div className="relative max-w-[1080px] lg:max-w-[760px] 3xl:max-w-[1200px] mx-auto">
          <div className="grid grid-cols-12 gap-4 lg:gap-5">
            <div className="col-span-4 flex justify-center">
              <TimelineCard
                year="2001"
                caption="CCI Projects is formed"
                image="/about/timeline-image-36.png"
                imageClass="object-[center_0%] origin-top scale-140"
                badge="/about/cci-logo.png"
                badgeClass="h-[35%] max-w-100"
              />
            </div>
            <div className="col-span-4 flex justify-center">
              <TimelineCard
                year="2016"
                caption="Completion of  Whitespring"
                image="/about/whitespring.png"
                imageClass="object-right origin-top-right translate-y-[0%]"
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

          <img
            src="/about/journey-bar.svg"
            alt=""
            aria-hidden="true"
            className="block w-full h-auto my-10 lg:my-3"
          />

          <div className="grid grid-cols-12 gap-4 lg:gap-5">
            <div className="col-span-4 col-start-3 flex justify-center">
              <TimelineCard
                year="2001 - 2010"
                caption="Factory operations moved from Borivali to Nashik. Master planning of Rivali Park begins"
                image="/about/timeline-image-36.png"
                imageClass="object-left origin-top-left scale-280 -translate-y-[68%]"
                badge="/about/rivali-park-white.png"
                badgeClass="h-[40%] max-w-100"
              />
            </div>
            <div className="col-span-4 col-start-7 flex justify-center">
              <TimelineCard
                year="2021"
                caption="Completion of Wintergreen"
                image="/about/rivali-transformation.jpg"
                imageClass="object-center origin-top scale-110 translate-y-[0%]"
              />
            </div>
          </div>
        </div>
      </section>
      <RaggedyDivider flipped />
    </>
  );
};

export default JourneyThroughTime;
