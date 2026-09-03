import { useCallback, useRef } from 'react'
import { PanoramaSyncContext } from './PanoramaSyncContext'

// Lets every <CurvedPanorama> mounted under this provider pan in lockstep:
// whichever instance the cursor is currently over computes the cursor's
// fraction (0-1 on each axis) of its own box and broadcasts it; every
// registered instance (including the source) turns that fraction through its
// OWN yaw range, so panoramas of differing widths still track the same relative
// position. A lone viewer under its own provider is just a group of one —
// broadcasting to itself reproduces unsynced behaviour.
export const PanoramaSyncProvider = ({ children }) => {
  const membersRef = useRef(new Map())

  const register = useCallback((id, applyFraction) => {
    membersRef.current.set(id, applyFraction)
    return () => membersRef.current.delete(id)
  }, [])

  const broadcast = useCallback((frac) => {
    membersRef.current.forEach((apply) => apply(frac))
  }, [])

  return (
    <PanoramaSyncContext.Provider value={{ register, broadcast }}>
      {children}
    </PanoramaSyncContext.Provider>
  )
}
