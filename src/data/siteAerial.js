// Site aerial behind the Amenities hub and the Towers landing (12 Oct render).
// Turned 180° so the towers sit where the overlays expect them (Skyleap top,
// Moonrise bottom, Sunburst/Stargaze right) and cropped to keep the render's
// watermark out.
export const SITE_AERIAL = '/gallery/site aerial bg.webp'
export const SITE_AERIAL_W = 3006
export const SITE_AERIAL_H = 1691

// Tower name pills on this render, as fractions of it (pill centre). Shared by
// the Amenities hub and the Towers landing so the names sit on the same roofs
// on both, at every screen shape.
export const TOWER_LABELS = {
  skyleap: { top: 0.12, left: 0.66 },
  sunburst: { top: 0.39, left: 0.867 },
  moonrise: { top: 0.83, left: 0.667 },
  stargaze: { top: 0.83, left: 0.86 },
}

// Framing for both pages (see hotspotStageStyle): everything they mark lies
// between the Sky Club outline (x 0.41) and the Sunburst pill (0.87), so the
// crop is centred there rather than on the render's middle, which kept the
// right-hand towers' names half off screen on 4:3 tablets.
export const SITE_AERIAL_FRAME = { mid: 0.64, span: 0.6 }
