// Shared 90px header for the unit-plan screens. The circular back button (+ a
// home button directly to its right) is pinned to the far-left edge, and the
// center slot (tower tabs or a unit title) is absolutely centered so it stays
// centered regardless of the button group's width.
const UnitHeader = ({ children, onBack, onHome }) => (
  <header className="absolute left-0 top-0 h-22.5 w-full">
    <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="grid h-15 w-15 cursor-pointer place-items-center rounded-full transition-[opacity,transform] hover:opacity-60 hover:-translate-x-0.5 active:scale-90"
      >
        <img src="/unit/svgs/arrow-left.svg" alt="" className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Go to homepage"
        onClick={onHome}
        className="grid h-15 w-15 cursor-pointer place-items-center rounded-full transition-[opacity,transform] hover:opacity-60 active:scale-90"
      >
        <img src="/unit/svgs/home.svg" alt="" className="h-6 w-6" />
      </button>
    </div>

    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {children}
    </div>

    {/* Right edge reserved for the Rivali Park wordmark (TODO: drop in once a
        dark-on-white logo asset is available). */}
  </header>
)

export default UnitHeader
