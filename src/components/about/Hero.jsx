const Hero = () => {
  return (
    <section className="bg-white">
      <div className="max-w-[1177px] lg:max-w-[900px] 3xl:max-w-[1320px] mx-auto px-8 lg:px-10 pt-12 lg:pt-20 pb-24 lg:pb-32">
        <div className="grid grid-cols-12 gap-6 lg:gap-10 items-stretch">
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="font-normal text-[40px] lg:text-[30px] 3xl:text-[54px] leading-[1.16] -tracking-[0.5px] text-on-light-black">
                A Quiet Evolution
              </h2>
              <img
                src="/about/powering-india.svg"
                alt="powering India to building homes"
                className="mt-3 lg:mt-1 h-[28px] lg:h-[32px] 3xl:h-[40px] w-auto lg:w-[17.5rem]"
              />
              <div className="mt-10 lg:mt-5 space-y-5 lg:space-y-3 text-on-light-black/85 text-[13px] lg:text-[10.5px] 3xl:text-[16px] leading-[1.85] max-w-[500px]">
                <p>
                  Owned by the Khataus, with decades of experience in
                  infrastructure across India (Cable Corporation of India).
                </p>
                <p className="max-w-[400px] lg:max-w-[280px]">
                  Corporate turned developer with long-standing credibility and
                  process oriented.
                </p>
              </div>
            </div>
            <img
              src="/about/crane-about-hero.svg"
              alt=""
              aria-hidden="true"
              className="mt-12 lg:mt-8 w-[400px] lg:w-[260px] max-w-full h-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:h-full lg:flex lg:justify-end">
            <div className="relative w-full lg:w-[400px] aspect-[611/404] lg:aspect-auto lg:h-full overflow-hidden">
              <img
                src="/about/hero-industrial.png"
                alt="CCI heritage industrial scene"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src="/about/about-hero-cloud-tree.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-x-0 top-3 w-[91%] h-auto pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
