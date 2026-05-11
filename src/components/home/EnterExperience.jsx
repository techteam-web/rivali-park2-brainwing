import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'

const textScale =
  'text-sm lg:text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl 5xl:text-4xl'

const EnterExperience = ({ isVideoReady, onEnter, onExit }) => {
  const containerRef = useRef(null)
  const overlayRef = useRef(null)

  const { contextSafe } = useGSAP(() => {}, { scope: containerRef })

  const handleClick = contextSafe(() => {
    onEnter()
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: onExit,
    })
  })

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-pastel-brown-bg"
      >
        {isVideoReady ? (
          <button
            type="button"
            onClick={handleClick}
            className={`${textScale} font-sans text-on-light-black uppercase tracking-[0.25em] border-b border-on-light-black/30 hover:border-on-light-black px-8 py-4 lg:px-10 lg:py-5 3xl:px-14 3xl:py-7 4xl:px-20 4xl:py-10 5xl:px-32 5xl:py-16 transition-colors`}
          >
            Enter Experience
          </button>
        ) : (
          <span
            className={`${textScale} font-sans text-on-light-grey uppercase tracking-[0.2em] animate-pulse`}
          >
            Loading…
          </span>
        )}
      </div>
    </div>
  )
}

export default EnterExperience
