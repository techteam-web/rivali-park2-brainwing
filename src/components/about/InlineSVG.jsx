import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

const cache = new Map()

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

  useEffect(() => {
    if (content !== null && containerRef.current) {
      containerRef.current.setAttribute('data-inline-svg-loaded', 'true')
    }
  }, [content])

  return (
    <div
      ref={containerRef}
      data-inline-svg=""
      className={className}
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
      {...rest}
    />
  )
})

export default InlineSVG
