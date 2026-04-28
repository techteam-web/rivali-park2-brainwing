import RaggedyDivider from './RaggedyDivider'

const masters = [
  {
    name: 'Hafeez Contractor',
    role: 'Master Design & Architecture',
    image: '/about/master-hafeez.png',
  },
  {
    name: 'Landscape Architects 49',
    role: 'Landscaping',
    image: '/about/master-predapond.jpg',
  },
  {
    name: 'August Design Consultant',
    role: 'Amenities',
    image: '/about/master-augustdesign.png',
  },
]

const MasterCard = ({ name, role, image }) => (
  <article className="w-full bg-white border border-on-light-stroke pb-4 overflow-hidden">
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-[center_0%]"
        loading="lazy"
      />
    </div>
    <div className="px-4 pt-4 pb-2">
      <p className="font-medium text-[16px] lg:text-[18px] tracking-[1.6px] lg:tracking-[1.8px] uppercase text-center text-on-light-black mb-2">
        {name}
      </p>
      <p className="text-[15px] lg:text-[16px] text-on-light-grey text-center leading-[1.6]">
        {role}
      </p>
    </div>
  </article>
)

const DesignedByMasters = () => {
  return (
    <>
      <RaggedyDivider />
      <section className="bg-pastel-brown-bg pt-2 pb-24 lg:pb-32 px-6 lg:px-10">
        <div className="max-w-[1180px] 3xl:max-w-[1320px] mx-auto">
          <div className="grid grid-cols-12 gap-6 lg:gap-10 items-end mb-14 lg:mb-20">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-normal text-[36px] lg:text-[44px] 3xl:text-[54px] leading-[1.16] -tracking-[0.5px] text-on-light-black">
                Designed By Masters
              </h2>
              <img
                src="/about/inspired-by-life.svg"
                alt="inspired by life"
                className="mt-3 h-6.5 lg:h-7.5 3xl:h-9 w-auto"
              />
              <p className="text-on-light-black/85 text-[13px] lg:text-[14px] 3xl:text-[16px] leading-[1.85] mt-7 max-w-[600px]">
                Crafted with vision by three acclaimed design houses, including
                the legendary Architect Hafeez Contractor, Rivali Park 2 is a
                celebration of intentionally designed spaces, landscapes, and
                life-enhancing amenities.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 flex lg:justify-end">
              <img
                src="/about/about-design-buildings.svg"
                alt=""
                aria-hidden="true"
                className="block w-full max-w-105 h-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
