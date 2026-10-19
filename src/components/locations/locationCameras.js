// Per-route camera framings for /locations, keyed by location id. Every framing
// keeps the Rivali towers, the whole route and its destination in shot (19 Oct:
// the long routes used to look away from the project, leaving it out of frame),
// solved for the closest camera that fits all three clear of the info card
// (top right), so far ends sit as little in the fog as possible.
// Selecting a location row flies the camera here (see CameraRig), the same way a
// category button flies to its framing in locationsConfig.cameraViews.
// healthcare-sanchiti is intentionally absent (that route was removed).

export const locationCameras = {
  'access-western-express-highway': { position: [1943.2, 865.6, 81.3], target: [2443.5, 60.0, 25.0] },
  'access-link-road': { position: [1319.5, 2524.2, 1285.3], target: [1260, 104.4, -53.7] },
  'access-sv-road': { position: [2206.4, 1063.7, -1301.4], target: [1825.1, 60, -253.9] },
  'access-borivali': { position: [1633.6, 1567.4, -173.1], target: [2065.0, 60, -687.2] },
  'access-malad': { position: [5399.5, 2169.3, -647.8], target: [3049.2, 818.8, 783] },
  'access-kandivali': { position: [5146, 2117.1, 432], target: [2614.4, 397.2, 596.7] },
  'access-dahisar': { position: [-833.2, 2611, -737.2], target: [1110, 729.7, -1317.3] },
  'access-magathane': { position: [2011.2, 865.6, 230.2], target: [2443.5, 60.0, -27.8] },
  'access-ovaripada': { position: [-698.3, 2467.2, -2306.6], target: [1391.9, 704.6, -1887] },
  'access-devipada': { position: [899, 2204, -1286.2], target: [1619.8, 1012.8, -1007.2] },
  'leisure-oberoi-sky-city': { position: [2703.9, 836.5, -493.3], target: [2379.0, 60, -375.1] },
  'leisure-raghuleela-mall': { position: [796.2, 1465.2, -1431.7], target: [1576.5, 60, -80.2] },
  'leisure-growels-mall': { position: [-490.8, 2402.7, -260.4], target: [1982.7, 606.7, -36.4] },
  'leisure-thakur-mall': { position: [97.9, 2090.5, -54.1], target: [1702.3, 483.9, -1377.1] },
  'leisure-carnival-cinema': { position: [5281.9, 3140, 1959.3], target: [2103, 446.9, 2125.8] },
  'leisure-pvr': { position: [4874.1, 3399, 1119], target: [2217.4, 361, 2166.9] },
  'leisure-evershine-dream-park': { position: [2641.2, 3420.5, 2438.9], target: [2486.9, 375.8, 571.8] },
  'healthcare-apex': { position: [2474.4, 653.8, -435.2], target: [2342.3, 60, -206.3] },
  'healthcare-surbhi': { position: [2606.8, 519.6, -234.8], target: [2414.0, 60, 99.2] },
  'healthcare-seven-star': { position: [2220.6, 745.2, 405.5], target: [2416.7, 60, 171.8] },
  'schools-singapore-international': { position: [5079.0, 4901.8, -2663.6], target: [2923.3, 60, -2663.6] },
  'schools-jbcn-international': { position: [581.2, 3394.4, -1003.7], target: [1866.9, 60, -1746.0] },
  'schools-chatrabhuj-narsee': { position: [2981.4, 1293.3, 587.4], target: [2886.0, 60, 46.7] },
  'schools-cambridge': { position: [1936.1, 1019.2, 266.7], target: [2356.7, 60, 340.9] },
  'schools-oxford-international': { position: [3453.3, 1841.4, -267.6], target: [2845.8, 60, 242.2] },
  'schools-childrens-academy': { position: [687.9, 2269.4, 1106.5], target: [2016.7, 254.9, 66.4] },
  'business-wadhwa-techno-park': { position: [557.1, 3348.8, -88.2], target: [1289.2, 60, -1356.3] },
  'business-agora-business-plaza': { position: [1910.9, 1476.0, -874.8], target: [1801.4, 60, -253.9] },
  'business-western-edge': { position: [2276.9, 865.6, 361.9], target: [2443.5, 60.0, -113.1] },
  'business-mahindra': { position: [1957.0, 1339.0, 805.9], target: [2450.1, 60, 521.2] },
  'parks-sanjay-gandhi-national-park': { position: [1716.1, 1613.0, -586.3], target: [2365.9, 60, -822.8] },
  'access-twin-tunnel': { position: [2061.9, 823.2, -434.8], target: [2510.1, 60, -271.7] },
  'leisure-oberoi-mall': { position: [147.3, 4673.4, 2069.9], target: [2201.3, 60, 2069.9] },
  'schools-oberoi-international': { position: [-41.9, 5175.9, 2755.2], target: [2201.2, 60, 2359.7] },
  'business-hines': { position: [1959.9, 865.6, 232.5], target: [2404.0, 60.0, -4.5] },
  'leisure-dmart': { position: [2064.7, 865.6, 330.9], target: [2404.0, 60.0, -41.0] },
  'healthcare-damania': { position: [2468.7, 889.0, 497.1], target: [2420.0, 60.0, -60.0] },
}

// null when a location has no per-route camera (falls back to the category framing).
export const getLocationCamera = (id) => locationCameras[id] ?? null
