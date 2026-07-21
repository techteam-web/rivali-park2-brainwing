import { useCallback, useRef } from 'react'
import { PanoramaSyncContext } from './PanoramaSyncContext'

// Lets every <Panorama> mounted under this provider pan in lockstep: whichever
// instance the cursor is currently over computes its own fraction (0-1) of its
// pan range and broadcasts it; every registered instance (including the
// source) applies that fraction using its OWN overflow, so panoramas of
// differing widths/crops still track the same relative position. A lone
// <Panorama> under its own provider is just a group of one — broadcasting to
// itself reproduces the original unsynced behavior.
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
