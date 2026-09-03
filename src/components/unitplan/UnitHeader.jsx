// Shared 90px header for the unit-plan screens — now just the centered slot
// (tower tabs or a unit title).
//
// The back/home buttons used to live here, but this header renders INSIDE
// <UnitArtboard>, whose scale transform stretched their offsets with the
// viewport height and put them somewhere different from the same two buttons on
// the towers screens. They're <PageNav> now, rendered by each page as a sibling
// of the artboard so they sit on real viewport pixels — identical everywhere.
const UnitHeader = ({ children }) => (
  <header className="absolute left-0 top-0 h-22.5 w-full">
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {children}
    </div>

    {/* Right edge reserved for the Rivali Park wordmark (TODO: drop in once a
        dark-on-white logo asset is available). */}
  </header>
)

export default UnitHeader
