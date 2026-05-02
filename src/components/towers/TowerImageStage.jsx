const RAGGEDY_PATH =
  'M228.254 23.0906C170.155 25.1932 105.329 21.3431 49.4354 19.2873L0 651.5H3140.42L3165.14 0C3106.83 1.9341 3050.7 3.42377 2996.62 7.32482C2967.65 9.41502 2941.87 12.371 2912.82 14.4736C2893.73 15.8551 2874.62 17.8926 2853.29 18.2416C2835.15 18.5384 2816.56 18.3825 2798.34 18.3825C2750.05 18.3825 2675.89 16.5179 2634.4 20.918C2609.93 23.5143 2600.25 27.2394 2571.67 29.1232C2549.57 30.5796 2523.69 31.6939 2499.55 31.6939C2477.68 31.6939 2453.49 32.1252 2432.46 31.2009C2390.96 29.3773 2351.65 29.7923 2307.91 29.7923L2295.54 31.06C2281.31 34.3449 2277.81 36.7649 2249.98 36.7649C2236.11 36.7649 2220.63 36.476 2206.94 36.8002C2189.77 37.2062 2185.46 39.583 2170.99 40.4274C2132.36 42.6811 2085.23 42.1597 2048.49 39.6174C2012.07 37.0961 1973.36 35.4972 1932.87 35.4972C1913.88 35.4972 1893.91 36.2997 1877.23 37.6805C1866.02 38.6089 1845.6 38.0327 1833.04 38.0327C1783.15 38.0327 1768.46 41.6799 1723.9 41.6799C1709.84 41.6799 1699.85 41.5918 1686.58 40.6939C1624.69 36.5057 1637.07 47.2455 1570.51 47.881C1517.35 48.3885 1463.68 41.9471 1411.85 43.7693C1389.92 44.5403 1351.48 38.8499 1329.11 39.2121C1308.62 39.5438 1243.36 42.8102 1227.28 42.9476C1214.01 43.0611 1202.31 39.3432 1187.9 39.2799C1172.1 39.2104 1157.04 38.0121 1140.74 38.0121C1127.83 38.0121 1114.63 38.1323 1101.81 37.8712C1089.55 37.6217 1080.1 36.4176 1068.61 36.1457C1044.3 35.5703 1019.73 42.0699 996.948 43.0885C976.516 44.002 920.783 39.1872 900.706 38.0756C887.846 37.3635 867.981 37.2273 854.015 37.2273C826.835 37.2273 818.525 35.5323 790.513 34.7489C768.836 34.1428 770.147 37.2273 746.864 37.2273L695.343 26.4116C676.291 26.4116 656.233 28.8463 637.849 29.6317C614.281 30.6386 584.773 18.1658 561.392 17.5266C538.092 16.8894 515.411 18.3717 492.246 18.3717C466.791 18.3717 444.928 16.5366 418.063 16.787C401.923 16.9375 387.007 17.9728 370.897 18.0196C356.433 18.0615 341.834 17.9016 327.394 18.0548C304.036 18.3025 289.072 21.0629 266.948 21.189C253.438 21.2659 241.165 22.6233 228.254 23.0906Z'

const TowerImageStage = ({ tower }) => {
  const ia = tower.imageAdjust || {}
  const imageWidth = ia.width ?? '90%'
  const imageObjectPosition = ia.objectPosition ?? 'center'
  const imageScale = ia.scale ?? 1
  const imageOffsetX = ia.offsetX ?? '0'
  const imageOffsetY = ia.offsetY ?? '0'
  const imageTransform = `translate(${imageOffsetX}, ${imageOffsetY}) scale(${imageScale})`

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Tower image — adjustments per tower come from data: imageAdjust = {
          width, objectPosition, scale, offsetX, offsetY } */}
      <img
        src={tower.image}
        alt={tower.name}
        className="absolute top-0 right-0 h-full object-cover"
        style={{
          width: imageWidth,
          objectPosition: imageObjectPosition,
          transform: imageTransform,
        }}
      />

      {/* Raggedy torn-paper LEFT edge — same shape as RaggedyDivider asset,
          rotated +90deg via SVG transform. Rendered at 200% of the image-stage
          height and vertically centered, so the container's overflow-hidden
          crops the top/bottom 25% and only the center half of the path is
          visible. Fill is white so the band blends with the page bg, leaving
          the torn edge as a visible boundary into the image. The shared
          RaggedyDivider component is untouched. */}
      <svg
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 651.5 3165.14"
        className="absolute left-[-8%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-1"
        style={{ width: '22%', height: '200%' }}
      >
        <g transform="translate(651.5 0) rotate(90)">
          <path d={RAGGEDY_PATH} fill="white" />
        </g>
      </svg>

      {/* Decorations — above the band so they're not clipped. Each item can
          carry an optional `style` field for transform/rotate/scale beyond
          what className handles. */}
      {tower.decorations?.map((d, i) => (
        <img
          key={i}
          src={d.src}
          alt=""
          aria-hidden="true"
          className={`${d.className} pointer-events-none select-none z-2`}
          style={d.style}
        />
      ))}
    </div>
  )
}

export default TowerImageStage
