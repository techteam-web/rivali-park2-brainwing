import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/about': 'ABOUT US',
  '/gallery': 'GALLERY',
  '/unit-plans': 'UNIT PLANS',
  '/maps': 'MAPS',
  '/360': '360',
}

// `onBack` lets the hosting page run its own animated exit (e.g. the gallery
// scale+blur+fade) before leaving, so back-to-home feels smooth instead of a
// hard cut. When omitted (e.g. the shared Layout header) it falls back to an
// immediate navigate home.
const Header = ({ onBack }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] ?? ''
  const isTowers = pathname === '/towers'

  return (
    <header
      className={`sticky top-0 z-50 pt-6 pb-4 px-6 ${
        isTowers
          ? 'md:pt-1 md:px-2 xl:pt-3 xl:px-6 2xl:pt-6 2xl:px-10 3xl:pt-6 3xl:px-12 4xl:pt-8 4xl:px-16 5xl:pt-12 5xl:px-24 bg-transparent'
          : 'lg:px-10 xl:px-12 2xl:px-14 3xl:px-16 4xl:px-20 5xl:px-28 xl:pt-8 xl:pb-5 2xl:pt-10 2xl:pb-6 3xl:pt-12 3xl:pb-8 4xl:pt-16 4xl:pb-10 5xl:pt-24 5xl:pb-14 bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Go to homepage"
          onClick={() => (onBack ? onBack() : navigate('/'))}
          className={`grid place-items-center w-9 h-9 lg:w-7 lg:h-7 ${
            isTowers
              ? '3xl:w-8 3xl:h-8 4xl:w-11 4xl:h-11 5xl:w-16 5xl:h-16'
              : 'xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 3xl:w-12 3xl:h-12 4xl:w-14 4xl:h-14 5xl:w-20 5xl:h-20'
          } -ml-1 hover:opacity-60 transition-opacity`}
        >
          <img
            src="/about/icon-arrow-left.svg"
            alt=""
            className={`w-5 h-5 lg:w-4 lg:h-4 ${
              isTowers
                ? '3xl:w-5 3xl:h-5 4xl:w-7 4xl:h-7 5xl:w-10 5xl:h-10'
                : 'xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12'
            }`}
          />
        </button>
        {!isTowers && (
          <>
            <h1 className="font-medium text-[18px] lg:text-[13px] xl:text-[16px] 2xl:text-[19px] 3xl:text-[24px] 4xl:text-[30px] 5xl:text-[42px] tracking-[2.5px] lg:tracking-[2px] xl:tracking-[2.4px] 2xl:tracking-[2.6px] 3xl:tracking-[3.2px] 4xl:tracking-[4px] 5xl:tracking-[5.5px] text-on-light-black uppercase">
              {title}
            </h1>
            <div className="w-9 h-9 lg:w-7 lg:h-7 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 3xl:w-12 3xl:h-12 4xl:w-14 4xl:h-14 5xl:w-20 5xl:h-20" aria-hidden="true" />
          </>
        )}
      </div>
    </header>
  )
}

export default Header
