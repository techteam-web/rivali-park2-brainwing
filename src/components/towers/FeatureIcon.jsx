const ICON_FILES = {
  floors:    '/towers/aminities%20svgs/floors.svg',
  views:     '/towers/aminities%20svgs/views.svg',
  premium:   '/towers/aminities%20svgs/premiumspecs.svg',
  vastu:     '/towers/aminities%20svgs/vastu.svg',
  windows:   '/towers/aminities%20svgs/windows.svg',
  balconies: '/towers/aminities%20svgs/balconies.svg',
}

const FeatureIcon = ({ name, className = '' }) => {
  const url = ICON_FILES[name]
  if (!url) return null
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      style={{
        WebkitMaskImage: `url('${url}')`,
        maskImage: `url('${url}')`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        backgroundColor: 'currentColor',
      }}
    />
  )
}

export default FeatureIcon
