import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Fires onReady once the scene has actually rendered, not merely finished
// downloading. Mount it INSIDE the Suspense boundary whose assets you are
// waiting on: it cannot tick until that boundary's children have resolved, so by
// the time it counts its second frame the textures/geometry are uploaded, the
// shaders have compiled, and the first real frame has painted — i.e. the heavy,
// main-thread-blocking init burst is over.
//
// Two frames is enough, and the ordering is worth spelling out. R3F runs useFrame
// subscribers before the render, so frame 1 counts to 1 and then pays the compile
// cost in the render that follows. Frame 2 counts to 2 and fires onReady, already
// past that stall. React schedules the resulting setState rather than running it
// synchronously, so anything it kicks off starts a frame later still.
//
// Callers use this to keep entrance/exit animations off the compile frame, which
// is what made them look glitchy: /towers holds its page entrance until it fires
// (see TowerDetail), /locations holds its loader's fade-out (see LocationsLoader).
const FirstFrameSignal = ({ onReady }) => {
  const frames = useRef(0)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current >= 2) {
      done.current = true
      onReady?.()
    }
  })

  return null
}

export default FirstFrameSignal
