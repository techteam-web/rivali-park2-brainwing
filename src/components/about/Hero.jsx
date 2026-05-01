const Hero = () => {
  return (
    <section className="bg-white">
      <div className="max-w-[1177px] lg:max-w-none xl:max-w-none 2xl:max-w-none 3xl:max-w-none 4xl:max-w-none 5xl:max-w-none mx-auto px-8 lg:px-[6%] xl:px-[6%] 2xl:px-[6%] 3xl:px-[6%] 4xl:px-[6%] 5xl:px-[6%] pt-12 lg:pt-20 xl:pt-24 2xl:pt-28 3xl:pt-32 4xl:pt-40 5xl:pt-56 pb-24 lg:pb-32 xl:pb-36 2xl:pb-44 3xl:pb-52 4xl:pb-64 5xl:pb-96">
        <div className="grid grid-cols-12 gap-6 lg:gap-10 xl:gap-10 2xl:gap-12 3xl:gap-16 4xl:gap-20 5xl:gap-28 items-stretch">
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="font-normal text-[40px] lg:text-[30px] xl:text-[42px] 2xl:text-[52px] 3xl:text-[66px] 4xl:text-[92px] 5xl:text-[138px] leading-[1.16] -tracking-[0.5px] text-on-light-black">
                A Quiet Evolution
              </h2>
              <img
                src="/about/powering-india.svg"
                alt="powering India to building homes"
                className="mt-3 lg:mt-1 xl:mt-2 3xl:mt-3 4xl:mt-4 5xl:mt-6 h-[28px] lg:h-[32px] xl:h-[40px] 2xl:h-[44px] 3xl:h-[50px] 4xl:h-[68px] 5xl:h-[100px] w-auto lg:w-[17.5rem] xl:w-[23rem] 2xl:w-[28rem] 3xl:w-[35rem] 4xl:w-[48rem] 5xl:w-[72rem]"
              />
              <div className="mt-10 lg:mt-5 xl:mt-6 2xl:mt-7 3xl:mt-9 4xl:mt-12 5xl:mt-16 space-y-5 lg:space-y-3 xl:space-y-4 2xl:space-y-5 3xl:space-y-6 4xl:space-y-7 5xl:space-y-10 text-on-light-black/85 text-[13px] lg:text-[10.5px] xl:text-[14px] 2xl:text-[17px] 3xl:text-[20px] 4xl:text-[27px] 5xl:text-[40px] leading-[1.85] max-w-[500px] 3xl:max-w-[600px] 4xl:max-w-[760px] 5xl:max-w-[1080px]">
                <p>
                  Owned by the Khataus, with decades of experience in
                  infrastructure across India (Cable Corporation of India).
                </p>
                <p className="max-w-[400px] lg:max-w-[280px] xl:max-w-[340px] 2xl:max-w-[400px] 3xl:max-w-[460px] 4xl:max-w-[580px] 5xl:max-w-[820px]">
                  Corporate turned developer with long-standing credibility and
                  process oriented.
                </p>
              </div>
            </div>
            <img
              src="/about/crane-about-hero.svg"
              alt=""
              aria-hidden="true"
              className="mt-12 lg:mt-8 xl:mt-10 2xl:mt-12 3xl:mt-16 4xl:mt-20 5xl:mt-28 w-[400px] lg:w-[260px] xl:w-[350px] 2xl:w-[430px] 3xl:w-[520px] 4xl:w-[720px] 5xl:w-[1080px] max-w-full h-auto"
            />
          </div>

          <div className="col-span-12 lg:col-span-7 lg:flex lg:justify-end">
            <div className="relative w-full lg:w-[400px] xl:w-[560px] 2xl:w-[700px] 3xl:w-[860px] 4xl:w-[1140px] 5xl:w-[1700px] aspect-[611/404] overflow-hidden self-start">
              <img
                src="/about/hero-industrial.png"
                alt="CCI heritage industrial scene"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src="/about/about-hero-cloud-tree.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-x-0 top-[7%] w-[91.5%] h-auto pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
