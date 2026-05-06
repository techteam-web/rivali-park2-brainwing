import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/about': 'ABOUT US',
  '/gallery': 'GALLERY',
  '/unit-plans': 'UNIT PLANS',
  '/maps': 'MAPS',
  '/360': '360',
}

const Header = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] ?? ''
  const isTowers = pathname === '/towers'

  return (
    <header
      className={`sticky top-0 z-50 pt-6 pb-4 px-6 ${
        isTowers
          ? 'md:pt-1 md:px-2 xl:pt-3 xl:px-6 2xl:pt-6 2xl:px-10 3xl:pt-6 3xl:px-12 4xl:pt-8 4xl:px-16 5xl:pt-12 5xl:px-24 bg-transparent'
          : 'lg:pt-3 lg:px-10 3xl:pt-6 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className={`grid place-items-center w-9 h-9 lg:w-7 lg:h-7 ${isTowers ? '3xl:w-8 3xl:h-8 4xl:w-11 4xl:h-11 5xl:w-16 5xl:h-16' : ''} -ml-1 hover:opacity-60 transition-opacity`}
        >
          <img src="/about/icon-arrow-left.svg" alt="" className={`w-5 h-5 lg:w-4 lg:h-4 ${isTowers ? '3xl:w-5 3xl:h-5 4xl:w-7 4xl:h-7 5xl:w-10 5xl:h-10' : ''}`} />
        </button>
        {!isTowers && (
          <>
            <h1 className="font-medium text-[18px] lg:text-[13px] 3xl:text-[24px] tracking-[2.5px] lg:tracking-[2px] text-on-light-black uppercase">
              {title}
            </h1>
            <div className="w-9 h-9 lg:w-7 lg:h-7" aria-hidden="true" />
          </>
        )}
      </div>
    </header>
  )
}

export default Header
