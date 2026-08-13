import { useRef, useState } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'
import useLoaderReady from '../hooks/useLoaderReady'
import SketchLoadingScreen from '../components/loaders/SketchLoadingScreen'
import LoaderVector from '../assets/construction/loader-vector.svg?react'
import LoaderSubheading from '../assets/construction/loader-subheading.svg?react'

// Full-screen YouTube playback reached from the home navbar (the "Video" and
// "Construction" tabs both render this with their own `videoId`). The video is
// rendered full-width at 16:9 and vertically centred on a black stage, so any
// extra page height reads as clean black bars. Click-to-play: the iframe only
// mounts on the play click, which IS the user gesture browsers require before
// audio — so it starts UNMUTED (mute=0) and the AV plays with sound by default.
//
// `vq=hd1080` asks YouTube to start at 1080p. YouTube still adapts to the
// viewer's bandwidth and can only ever serve a rendition the upload actually
// has, so this is a request, not a guarantee.
//
// `showLoader` enables the hand-sketch loading overlay (used by /construction).
const Video = ({ videoId = 'fYk0s5Ja9iM', showLoader = false }) => {
  const pageRef = useRef(null)
  const { exitTo } = usePageTransition({ containerRef: pageRef })
  const [playing, setPlaying] = useState(false)
  const ready = useLoaderReady()
  const [overlayGone, setOverlayGone] = useState(!showLoader)

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&vq=hd1080`

  return (
    <div ref={pageRef} className="h-full w-full relative overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full aspect-video bg-black">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={src}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              aria-label="Play video"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex items-center justify-center bg-black focus:outline-none"
            >
              <span className="flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 group-hover:bg-white/30 group-hover:scale-[1.05] group-focus-visible:bg-white/30 group-focus-visible:scale-[1.05] h-16 w-16 xl:h-20 xl:w-20 2xl:h-24 2xl:w-24 3xl:h-28 3xl:w-28 4xl:h-36 4xl:w-36 5xl:h-52 5xl:w-52">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-1 h-7 w-7 xl:h-8 xl:w-8 2xl:h-10 2xl:w-10 3xl:h-12 3xl:w-12 4xl:h-16 4xl:w-16 5xl:h-24 5xl:w-24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Back"
        data-back-btn
        onClick={() => exitTo('/')}
        className="absolute top-5 left-5 z-20 flex items-center justify-center rounded-full bg-white/20 text-white transition-[transform,background-color] duration-200 hover:bg-white/30 hover:scale-[1.05] focus:outline-none focus-visible:bg-white/30 focus-visible:scale-[1.05] h-8 w-8 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 3xl:h-15 3xl:w-15 4xl:h-20 4xl:w-20 5xl:h-30 5xl:w-30"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 3xl:w-6 3xl:h-6 4xl:w-8 4xl:h-8 5xl:w-12 5xl:h-12"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {showLoader && !overlayGone && (
        <SketchLoadingScreen
          ready={ready}
          onExitComplete={() => setOverlayGone(true)}
          Vector={LoaderVector}
          vectorClassName="w-32 md:w-36 lg:w-36 2xl:w-44 3xl:w-52 h-auto"
          heading="Progress"
          Subheading={LoaderSubheading}
          subheadingClassName="w-60 md:w-72 lg:w-72 2xl:w-80 h-auto"
        />
      )}
    </div>
  )
}

export default Video
