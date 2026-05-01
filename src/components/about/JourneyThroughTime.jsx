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
  <article className="w-full max-w-[260px] lg:max-w-[200px] xl:max-w-[310px] 2xl:max-w-[380px] 3xl:max-w-[460px] 4xl:max-w-[640px] 5xl:max-w-[950px] mx-auto bg-white border border-on-light-stroke flex flex-col min-h-[290px] lg:min-h-[215px] xl:min-h-[330px] 2xl:min-h-[410px] 3xl:min-h-[500px] 4xl:min-h-[700px] 5xl:min-h-[1040px]">
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
    <div className="flex-1 px-4 py-4 lg:px-3 lg:py-3 xl:px-4 xl:py-4 2xl:px-5 2xl:py-5 3xl:px-6 3xl:py-6 4xl:px-8 4xl:py-8 5xl:px-11 5xl:py-11">
      <p className="font-medium text-[14px] lg:text-[11px] xl:text-[15px] 2xl:text-[18px] 3xl:text-[21px] 4xl:text-[28px] 5xl:text-[40px] text-on-light-black mb-1 lg:mb-0">
        {year}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[14px] 2xl:text-[17px] 3xl:text-[19px] 4xl:text-[26px] 5xl:text-[38px] text-on-light-grey leading-[1.55]">
        {caption}
      </p>
    </div>
  </article>
);

const JourneyThroughTime = () => {
  return (
    <>
      <RaggedyDivider />
      <section className="bg-pastel-brown-bg pt-2 px-6 lg:px-[9%] xl:px-[9%] 2xl:px-[9%] 3xl:px-[9%] 4xl:px-[9%] 5xl:px-[9%]">
        <div className="text-center lg:-mt-[120px] lg:min-h-[150px] lg:flex lg:flex-col lg:items-center lg:justify-center xl:-mt-[160px] xl:min-h-[300px] 2xl:-mt-[200px] 2xl:min-h-[360px] 3xl:-mt-[240px] 3xl:min-h-[440px] 4xl:-mt-[320px] 4xl:min-h-[560px] 5xl:-mt-[460px] 5xl:min-h-[800px]">
          <h2 className="font-normal text-[40px] lg:text-[36px] xl:text-[64px] 2xl:text-[76px] 3xl:text-[92px] 4xl:text-[128px] 5xl:text-[192px] leading-[1.2] -tracking-[1px] text-on-light-black">
            A journey through time
          </h2>
          <img
            src="/about/shaping-a-legacy.svg"
            alt="shaping a legacy of innovation"
            className="mx-auto mt-3 h-6.5 lg:h-7 xl:h-12 2xl:h-13 3xl:h-16 4xl:h-22 5xl:h-30 w-auto"
          />
        </div>

        <div className="relative max-w-[1080px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto">
          <div className="grid grid-cols-12 gap-4 lg:gap-12 xl:gap-14 2xl:gap-16 3xl:gap-20 4xl:gap-26 5xl:gap-36">
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
            className="block w-full lg:w-[105%] lg:-mx-[2.5%] lg:max-w-none xl:w-[110%] xl:-mx-[5%] 2xl:w-[112%] 2xl:-mx-[6%] 3xl:w-[114%] 3xl:-mx-[7%] 4xl:w-[116%] 4xl:-mx-[8%] 5xl:w-[118%] 5xl:-mx-[9%] h-auto my-10 lg:my-3 xl:my-5 2xl:my-6 3xl:my-8 4xl:my-10 5xl:my-14"
          />

          <div className="grid grid-cols-12 gap-4 lg:gap-12 xl:gap-14 2xl:gap-16 3xl:gap-20 4xl:gap-26 5xl:gap-36">
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
