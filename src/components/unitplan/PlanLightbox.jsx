// Fullscreen plan viewer, opened from the expand icon on any unit plan. A white
// header carries the "{TOWER} UNIT PLAN" title and a close-cross button; below
// it the raggedy edge tears the white into the tower-coloured plan area, where
// the self-contained sheet (title/carpet/balcony/compass/disclaimer baked in)
// is shown in full. `bg` matches the sheet's own background so the contained
// image blends edge-to-edge with no letterbox seam.
//
// Rendered outside the scaled <UnitArtboard> so it covers the real viewport.
const PlanLightbox = ({ src, alt = 'Floor plan', title, bg = '#9C6A7B', onClose }) => (
  <div className="fixed inset-0 z-50 flex flex-col bg-white">
    <header className="relative flex h-22.5 shrink-0 items-center justify-center px-10">
      <h2
        className="uppercase"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: '0.12em',
          color: '#313131',
        }}
      >
        {title}
      </h2>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-8 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center transition-opacity hover:opacity-60"
      >
        <img src="/unit/svgs/close cross.svg" alt="" className="h-6 w-6" />
      </button>
    </header>

    <div
      className="relative flex-1 overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <img src={src} alt={alt} className="h-full w-full object-contain" />
      {/* Torn white edge bridging the header into the coloured plan area. */}
      <img
        src="/unit plan/Vector raggedy edge.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 w-full select-none"
      />
    </div>
  </div>
)

export default PlanLightbox
