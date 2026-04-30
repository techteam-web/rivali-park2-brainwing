const RaggedyDivider = ({ flipped = false, src = '/about/raggedy-edge-mid.svg' }) => (
  <div aria-hidden="true" className="w-[100vw] overflow-hidden leading-[0]">
    <img
      src={src}
      alt=""
      className={`block w-[140%] max-w-none -ml-[20%] h-[80px] lg:h-[120px] xl:h-[160px] 3xl:h-[200px] ${flipped ? '-scale-y-100' : ''}`}
    />
  </div>
)

export default RaggedyDivider
