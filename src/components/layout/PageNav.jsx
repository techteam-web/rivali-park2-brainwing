// The project's one back/home control group.
//
// Its position, hit areas, icon sizes and breakpoint steps are the ones the
// towers screens (TowerDetail / TowerElevation) established, lifted here
// verbatim so every screen that shows these controls puts them on the exact
// same pixels. Anything that needs a back arrow and/or a home button renders
// this — no screen re-implements the geometry.
//
// IMPORTANT: it positions itself against its nearest positioned ancestor in
// REAL viewport pixels, so it must never be rendered inside <UnitArtboard>.
// The artboard's scale transform would rescale these offsets and the buttons
// would drift off the shared position at every viewport height. Render it as a
// sibling of the artboard instead.
//
// `onBack` is optional. Screens that close rather than go back (the courtyard
// / "view from apartment" overlay, whose close-cross lives on the torn edge)
// pass only `onHome`; the back slot is then held open by an inert spacer so the
// home button still lands on its usual coordinates instead of sliding left.
const BTN =
  'grid h-9 w-9 lg:h-7 lg:w-7 xl:h-9 xl:w-9 2xl:h-10 2xl:w-10 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14 5xl:h-20 5xl:w-20 place-items-center'
const ICON =
  'w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12'

const PageNav = ({ onBack, onHome, backLabel = 'Go back' }) => (
  <div className="absolute left-5 top-3 md:left-8 md:top-4 lg:left-10 xl:left-14 xl:top-5 2xl:left-15 2xl:top-6 3xl:left-18 3xl:top-8 4xl:left-24 4xl:top-10 5xl:left-36 5xl:top-14 z-40 flex items-center gap-2 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 4xl:gap-4 5xl:gap-6">
    {onBack ? (
      <button
        type="button"
        aria-label={backLabel}
        onClick={onBack}
        className={`${BTN} cursor-pointer hover:opacity-60 transition-opacity`}
      >
        <img src="/about/icon-arrow-left.svg" alt="" className={ICON} />
      </button>
    ) : (
      <div className={BTN} aria-hidden="true" />
    )}
    <button
      type="button"
      aria-label="Go to homepage"
      onClick={onHome}
      className={`${BTN} cursor-pointer hover:opacity-60 transition-opacity`}
    >
      <img src="/about/icon-home.svg" alt="" className={ICON} />
    </button>
  </div>
)

export default PageNav
