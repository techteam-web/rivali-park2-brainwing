// Small disclaimer line in the top-right corner of a full-screen image
// (12 Oct feedback): "Artist's impression" over project renders, "Stock image"
// over amenity photos. The box matches the back/home buttons' height at every
// breakpoint so the text sits on the same line as them.
const LABELS = {
  render: 'Artist’s impression',
  stock: 'Stock image',
}

const ImageNote = ({ kind = 'render' }) => (
  <div className="pointer-events-none absolute top-5 right-5 z-60 flex items-center h-8 xl:h-10 2xl:h-12 3xl:h-15 4xl:h-20 5xl:h-30 xl:right-6 2xl:right-7 3xl:right-9 4xl:right-12 5xl:right-18">
    <span className="font-normal tracking-wide text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] text-[10px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[14px] 4xl:text-[18px] 5xl:text-[27px]">
      {LABELS[kind]}
    </span>
  </div>
)

export default ImageNote
