// Per-route camera framings for /locations, keyed by location id.
// Selecting a location row flies the camera here (see CameraRig), the same way a
// category button flies to its framing in locationsConfig.cameraViews.
// healthcare-sanchiti is intentionally absent (that route was removed).

export const locationCameras = {
  'access-western-express-highway': { position: [838.8, 791.8, -633.7], target: [2259.5, 109.6, -124.8] },
  'access-link-road': { position: [1319.5, 2524.2, 1285.3], target: [1260, 104.4, -53.7] },
  'access-sv-road': { position: [4313.9, 3225, 5161.3], target: [2090, -215.7, 2541] },
  'access-borivali': { position: [-1225, 2575.9, -427.5], target: [776.2, 707.5, -822.7] },
  'access-malad': { position: [5399.5, 2169.3, -647.8], target: [3049.2, 818.8, 783] },
  'access-kandivali': { position: [5146, 2117.1, 432], target: [2614.4, 397.2, 596.7] },
  'access-dahisar': { position: [-833.2, 2611, -737.2], target: [1110, 729.7, -1317.3] },
  'access-magathane': { position: [-155.4, 1600.4, -1152.8], target: [1149.4, 594.4, -984.4] },
  'access-ovaripada': { position: [-698.3, 2467.2, -2306.6], target: [1391.9, 704.6, -1887] },
  'access-devipada': { position: [899, 2204, -1286.2], target: [1619.8, 1012.8, -1007.2] },
  'leisure-oberoi-sky-city': { position: [2545.5, 1791.5, -2030.7], target: [2279.7, 92.4, -575.1] },
  'leisure-raghuleela-mall': { position: [1450.3, 2152.2, -2761], target: [1927.4, 85, -548.9] },
  'leisure-growels-mall': { position: [-490.8, 2402.7, -260.4], target: [1982.7, 606.7, -36.4] },
  'leisure-thakur-mall': { position: [97.9, 2090.5, -54.1], target: [1702.3, 483.9, -1377.1] },
  'leisure-carnival-cinema': { position: [5281.9, 3140, 1959.3], target: [2103, 446.9, 2125.8] },
  'leisure-pvr': { position: [4874.1, 3399, 1119], target: [2217.4, 361, 2166.9] },
  'leisure-evershine-dream-park': { position: [2641.2, 3420.5, 2438.9], target: [2486.9, 375.8, 571.8] },
  'healthcare-apex': { position: [426.7, 1321.4, -239], target: [2253.9, 12.7, -398.8] },
  'healthcare-surbhi': { position: [1082.5, 1219.7, -503.7], target: [2236.4, 102.6, -98.7] },
  'healthcare-seven-star': { position: [1368, 1935.1, 99.1], target: [2326.3, 145.3, -15.4] },
  'schools-singapore-international': { position: [-828.7, 3559.5, -1097.4], target: [2166.9, 213.3, -2181.3] },
  'schools-jbcn-international': { position: [-1008.4, 2731.6, 86.1], target: [1772.6, 120.1, -2519.9] },
  'schools-chatrabhuj-narsee': { position: [2718.4, 2395.2, -2789.1], target: [2622.6, 400.7, -463.7] },
  'schools-cambridge': { position: [3625.1, 2710.8, 2349.8], target: [2503.4, 386.6, 696.2] },
  'schools-oxford-international': { position: [1167.5, 2959, 1729.6], target: [2518.3, 524.6, 447.6] },
  'schools-childrens-academy': { position: [687.9, 2269.4, 1106.5], target: [2016.7, 254.9, 66.4] },
  'business-wadhwa-techno-park': { position: [-2065.4, 2709.9, 323.7], target: [1069.1, -427.6, -970.4] },
  'business-agora-business-plaza': { position: [2637.5, 2342.1, -1976.7], target: [2004.7, -46.7, -436.8] },
  'business-western-edge': { position: [3658.6, 1894.2, 310], target: [2115.9, -182.7, -150.4] },
  'business-mahindra': { position: [-200.5, 2509.3, 2368.3], target: [2136.4, -271.5, 788.6] },
  'parks-sanjay-gandhi-national-park': { position: [272.3, 720.1, 591], target: [2309, 80.9, -941.7] },
}

// null when a location has no per-route camera (falls back to the category framing).
export const getLocationCamera = (id) => locationCameras[id] ?? null
