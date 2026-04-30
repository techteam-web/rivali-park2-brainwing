const visionaries = [
  { name: 'Rohan Khatau', role: 'Director', image: '/about/visionary-rohan.jpg', className:"object-[100%_0%]" },
  { name: 'Shijil Meledath', role: 'Chief Operating Officer', image: '/about/visionary-shijil.jpg', className:"object-[100%_0%]" },
  { name: 'Raunaq Rathi', role: 'VP, Strategy and Business', image: '/about/visionary-raunaq.jpg', className:"object-[100%_0%]" },
  { name: 'Vatsal Vazir', role: 'Head of Design', image: '/about/visionary-vatsal.jpg', className:"object-[100%_0%]" },
  { name: 'Harshil Shah', role: 'Head of Customer Experience', image: '/about/visionary-harshil.jpg', className:"object-[100%_0%]" },
]

const VisionaryCard = ({ name, role, image, className = '' }) => (
  <article className="w-full bg-pastel-brown-bg border border-on-light-stroke pb-3 lg:pb-2 xl:pb-3 2xl:pb-4 3xl:pb-5 4xl:pb-7 5xl:pb-10 overflow-hidden">
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover ${className} scale-115 `}
        loading="lazy"
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1 xl:px-3 xl:pt-4 xl:pb-2 2xl:px-4 2xl:pt-5 2xl:pb-3 3xl:px-5 3xl:pt-6 3xl:pb-4 4xl:px-7 4xl:pt-8 4xl:pb-5 5xl:px-10 5xl:pt-12 5xl:pb-7">
      <p className="font-medium text-[13px] lg:text-[11px] xl:text-[13px] 2xl:text-[15px] 3xl:text-[17px] 4xl:text-[21px] 5xl:text-[30px] tracking-[1.4px] lg:tracking-[1.2px] xl:tracking-[1.4px] 2xl:tracking-[1.6px] 3xl:tracking-[1.8px] 4xl:tracking-[2.2px] 5xl:tracking-[3px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 4xl:mb-4 5xl:mb-6">
        {name}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[20px] 5xl:text-[28px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const Visionaries = () => {
  return (
    <section className="bg-white pt-20 lg:pt-16 xl:pt-20 2xl:pt-24 3xl:pt-28 4xl:pt-36 5xl:pt-52 pb-20 lg:pb-16 xl:pb-20 2xl:pb-24 3xl:pb-28 4xl:pb-36 5xl:pb-52 px-6 lg:px-10 xl:px-12 2xl:px-14 3xl:px-16 4xl:px-20 5xl:px-28">
      <div className="text-center mb-14 lg:mb-10 xl:mb-14 2xl:mb-16 3xl:mb-20 4xl:mb-28 5xl:mb-44">
        <h2 className="font-normal text-[40px] lg:text-[36px] xl:text-[44px] 2xl:text-[52px] 3xl:text-[64px] 4xl:text-[80px] 5xl:text-[112px] leading-[1.2] -tracking-[1px] text-on-light-black">
          The visionaries
        </h2>
        <img
          src="/about/led-by-legacy.svg"
          alt="led by legacy, fuelled by foresight"
          className="mt-3 mx-auto h-auto w-[35rem] lg:w-[22rem] xl:w-[26rem] 2xl:w-[31rem] 3xl:w-[36rem] 4xl:w-[46rem] 5xl:w-[64rem]"
        />
      </div>

      <div className="max-w-[820px] lg:max-w-[620px] xl:max-w-[760px] 2xl:max-w-[900px] 3xl:max-w-[1080px] 4xl:max-w-[1360px] 5xl:max-w-[2000px] mx-auto grid grid-cols-12 gap-5 lg:gap-4 xl:gap-5 2xl:gap-6 3xl:gap-7 4xl:gap-9 5xl:gap-13">
        <div className="col-span-4">
          <VisionaryCard {...visionaries[0]} />
        </div>
        <div className="col-span-4">
          <VisionaryCard {...visionaries[1]} />
        </div>
        <div className="col-span-4">
          <VisionaryCard {...visionaries[2]} />
        </div>
        <div className="col-span-4 col-start-3">
          <VisionaryCard {...visionaries[3]} />
        </div>
        <div className="col-span-4 col-start-7">
          <VisionaryCard {...visionaries[4]} />
        </div>
      </div>
    </section>
  )
}

export default Visionaries
