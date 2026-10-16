// Site aerial behind the Home cover, the Amenities hub and the Towers landing.
// The 12 Oct render, turned 180° (Skyleap top, Moonrise bottom,
// Sunburst/Stargaze right) and framed exactly as the intro video's last frame
// (16 Oct cut), so the video dissolves into it with nothing moving. The
// render's watermark corner is replaced with the same corner from that frame.
export const SITE_AERIAL = '/gallery/site aerial bg.webp'
export const SITE_AERIAL_W = 3821
export const SITE_AERIAL_H = 2149

// Tower name pills on this render, as fractions of it (pill centre). Shared by
// the Amenities hub and the Towers landing so the names sit on the same roofs
// on both, at every screen shape.
export const TOWER_LABELS = {
  skyleap: { top: 0.1364, left: 0.579 },
  sunburst: { top: 0.3489, left: 0.7419 },
  moonrise: { top: 0.6952, left: 0.5845 },
  stargaze: { top: 0.6952, left: 0.7364 },
}

// Framing for both pages (see hotspotStageStyle): everything they mark lies
// between the Sky Club outline (x 0.38) and the Sunburst pill (0.74), so the
// crop is centred there rather than on the render's middle, which kept the
// right-hand towers' names half off screen on 4:3 tablets. On a 16:9 screen
// the whole render shows.
export const SITE_AERIAL_FRAME = { mid: 0.5633, span: 0.4721 }
