import RaggedyDivider from './RaggedyDivider'

const masters = [
  {
    name: 'Hafeez Contractor',
    role: 'Master Design & Architecture',
    image: '/about/master-hafeez.png',
    className: "object-[50%_0%] origin-center translate-y-[5%] scale-130",
  },
  {
    name: 'Landscape Architects 49',
    role: 'Landscaping',
    image: '/about/master-predapond.jpg',
    className: "object-[50%_0%] origin-top -translate-y-[5%] scale-135",
  },
  {
    name: 'August Design Consultant',
    role: 'Amenities',
    image: '/about/master-augustdesign.png',
    className: "object-[10%_0%] origin-top -translate-y-[3%] scale-135",
  },
]

const MasterCard = ({ name, role, image, className = '' }) => (
  <article className="w-full bg-white border border-on-light-stroke overflow-hidden">
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
        loading="lazy"
      />
    </div>
    <div className="px-3 pt-4 pb-2 lg:px-2 lg:pt-3 lg:pb-1 xl:px-3 xl:pt-4 xl:pb-2 2xl:px-4 2xl:pt-5 2xl:pb-3 3xl:px-5 3xl:pt-6 3xl:pb-4 4xl:px-7 4xl:pt-8 4xl:pb-5 5xl:px-10 5xl:pt-12 5xl:pb-7 bg-pastel-brown-bg border-t border-on-light-stroke">
      <p className="font-medium text-[13px] lg:text-[11px] xl:text-[13px] 2xl:text-[15px] 3xl:text-[17px] 4xl:text-[21px] 5xl:text-[30px] tracking-[1.4px] lg:tracking-[1.2px] xl:tracking-[1.4px] 2xl:tracking-[1.6px] 3xl:tracking-[1.8px] 4xl:tracking-[2.2px] 5xl:tracking-[3px] uppercase text-center text-on-light-black mb-2 lg:mb-1.5 xl:mb-2 2xl:mb-2.5 3xl:mb-3 4xl:mb-4 5xl:mb-6">
        {name}
      </p>
      <p className="text-[12.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[14px] 3xl:text-[16px] 4xl:text-[20px] 5xl:text-[28px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const DesignedByMasters = () => {
  return (
    <>
      <RaggedyDivider />
      <section className="bg-pastel-brown-bg pt-2 pb-24 lg:pb-20 xl:pb-24 2xl:pb-28 3xl:pb-32 4xl:pb-40 5xl:pb-56 px-6 lg:px-10 xl:px-12 2xl:px-14 3xl:px-16 4xl:px-20 5xl:px-28">
        <div className="max-w-[1180px] lg:max-w-[820px] xl:max-w-[1000px] 2xl:max-w-[1180px] 3xl:max-w-[1380px] 4xl:max-w-[1750px] 5xl:max-w-[2600px] mx-auto">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-14 4xl:gap-18 5xl:gap-24 items-end mb-14 lg:mb-16 xl:mb-20 2xl:mb-24 3xl:mb-28 4xl:mb-36 5xl:mb-52">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-normal text-[36px] lg:text-[34px] xl:text-[42px] 2xl:text-[48px] 3xl:text-[54px] 4xl:text-[68px] 5xl:text-[96px] leading-[1.16] -tracking-[0.5px] text-on-light-black">
                Designed By Masters
              </h2>
              <img
                src="/about/inspired-by-life.svg"
                alt="inspired by life"
                className="mt-3 h-6.5 lg:h-5.5 xl:h-6.5 2xl:h-7.5 3xl:h-9 4xl:h-12 5xl:h-16 w-auto"
              />
              <p className="text-on-light-black/85 text-[13px] lg:text-[10.5px] xl:text-[13px] 2xl:text-[15px] 3xl:text-[16px] 4xl:text-[20px] 5xl:text-[28px] leading-[1.85] mt-7 lg:mt-5 xl:mt-7 2xl:mt-8 3xl:mt-9 4xl:mt-12 5xl:mt-16 max-w-[600px] 4xl:max-w-[760px] 5xl:max-w-[1080px]">
                Crafted with vision by three acclaimed design houses, including
                the legendary Architect Hafeez Contractor, Rivali Park 2 is a
                celebration of intentionally designed spaces, landscapes, and
                life-enhancing amenities.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 flex lg:justify-end">
              <img
                src="/about/designed-clouds-buildings.svg"
                alt=""
                aria-hidden="true"
                className="block w-full max-w-105 lg:max-w-[260px] xl:max-w-[340px] 2xl:max-w-[400px] 3xl:max-w-[480px] 4xl:max-w-[600px] 5xl:max-w-[860px] h-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 5xl:gap-18">
            {masters.map((m) => (
              <MasterCard key={m.name} {...m} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default DesignedByMasters
