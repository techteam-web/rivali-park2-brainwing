import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/about': 'ABOUT US',
  '/towers': 'TOWERS',
  '/gallery': 'GALLERY',
  '/unit-plans': 'UNIT PLANS',
  '/maps': 'MAPS',
  '/360': '360',
}

const Header = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] ?? ''

  return (
    <header className="sticky top-0 z-50 bg-white pt-6 pb-4 px-6 lg:px-10">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="grid place-items-center w-9 h-9 lg:w-7 lg:h-7 -ml-1 hover:opacity-60 transition-opacity"
        >
          <img src="/about/icon-arrow-left.svg" alt="" className="w-5 h-5 lg:w-4 lg:h-4" />
        </button>
        <h1 className="font-medium text-[18px] lg:text-[13px] 3xl:text-[24px] tracking-[2.5px] lg:tracking-[2px] text-on-light-black uppercase">
          {title}
        </h1>
        <div className="w-9 h-9 lg:w-7 lg:h-7" aria-hidden="true" />
      </div>
    </header>
  )
}

export default Header
