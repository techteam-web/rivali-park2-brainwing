import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { gsap } from '../../lib/gsap'

const cache = new Map()

// Same shape as the per-page DRAW_SEL — kept local so the InlineSVG
// can pre-hide drawable shapes the moment content lands (see below).
const DRAW_SEL =
  'path:not([data-no-draw]):not([data-no-undraw]),' +
  'line:not([data-no-draw]):not([data-no-undraw]),' +
  'polyline:not([data-no-draw]):not([data-no-undraw]),' +
  'polygon:not([data-no-draw]):not([data-no-undraw]),' +
  'circle:not([data-no-draw]):not([data-no-undraw]),' +
  'ellipse:not([data-no-draw]):not([data-no-undraw]),' +
  'rect:not([data-no-draw]):not([data-no-undraw])'

const InlineSVG = forwardRef(function InlineSVG(
  { src, className = '', ...rest },
  ref,
) {
  const containerRef = useRef(null)
  const [content, setContent] = useState(() => cache.get(src) ?? null)

  useImperativeHandle(ref, () => containerRef.current, [])

  useEffect(() => {
    if (cache.has(src)) {
      setContent(cache.get(src))
      return
    }
    let cancelled = false
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return
        cache.set(src, text)
        setContent(text)
      })
      .catch(() => {
        if (!cancelled) setContent('')
      })
    return () => {
      cancelled = true
    }
  }, [src])

  // Run synchronously between commit and paint so any drawable strokes
  // are snapped to opacity: 0 + drawSVG: 0 *before* the browser shows
  // them. Without this, a freshly fetched SVG flashes fully-drawn for a
  // frame before the parent's draw-in animation can hide it. We use
  // opacity (matching the [data-draw] CSS default) rather than
  // stroke-dasharray alone because round linecaps on a zero-length dash
  // still paint a visible cap dot — opacity hides the whole stroke.
  // Gated on [data-draw] so SVGs that aren't part of the draw-in
  // choreography stay visible.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (content === null || !el) return
    if (el.hasAttribute('data-draw')) {
      const paths = el.querySelectorAll(DRAW_SEL)
      if (paths.length) gsap.set(paths, { opacity: 0, drawSVG: 0 })
    }
    el.setAttribute('data-inline-svg-loaded', 'true')
  }, [content])

  return (
    <div
      ref={containerRef}
      data-inline-svg=""
      data-inline-svg-src={src}
      className={className}
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
      {...rest}
    />
  )
})

export default InlineSVG
