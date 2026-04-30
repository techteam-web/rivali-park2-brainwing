const visionaries = [
  { name: 'Rohan Khatau', role: 'Director', image: '/about/visionary-rohan.jpg', className:"object-[100%_0%]" },
  { name: 'Shijil Meledath', role: 'Chief Operating Officer', image: '/about/visionary-shijil.jpg', className:"object-[100%_0%]" },
  { name: 'Raunaq Rathi', role: 'VP, Strategy and Business', image: '/about/visionary-raunaq.jpg', className:"object-[100%_0%]" },
  { name: 'Vatsal Vazir', role: 'Head of Design', image: '/about/visionary-vatsal.jpg', className:"object-[100%_0%]" },
  { name: 'Harshil Shah', role: 'Head of Customer Experience', image: '/about/visionary-harshil.jpg', className:"object-[100%_0%]" },
]

const VisionaryCard = ({ name, role, image, className = '' }) => (
  <article className="w-full bg-pastel-brown-bg border border-on-light-stroke pb-3 lg:pb-2 overflow-hidden">
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover ${className} scale-115 `}
        loading="lazy"
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1">
      <p className="font-medium text-[13px] lg:text-[11px] tracking-[1.4px] lg:tracking-[1.2px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5">
        {name}
      </p>
      <p className="text-[12.5px] lg:text-[10px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const Visionaries = () => {
  return (
    <section className="bg-white pt-20 lg:pt-16 pb-20 lg:pb-16 px-6 lg:px-10">
      <div className="text-center mb-14 lg:mb-10">
        <h2 className="font-normal text-[40px] lg:text-[36px] 3xl:text-[64px] leading-[1.2] -tracking-[1px] text-on-light-black">
          The visionaries
        </h2>
        <img
          src="/about/led-by-legacy.svg"
          alt="led by legacy, fuelled by foresight"
          className="mt-3 mx-auto h-auto w-[35rem] lg:w-[22rem]"
        />
      </div>

      <div className="max-w-[820px] lg:max-w-[620px] 3xl:max-w-[920px] mx-auto grid grid-cols-12 gap-5 lg:gap-4">
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
