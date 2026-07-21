import { useContext } from 'react'
import { PanoramaSyncContext } from '../components/unitplan/PanoramaSyncContext'

export const usePanoramaSync = () => {
  const ctx = useContext(PanoramaSyncContext)
  if (!ctx) {
    throw new Error('usePanoramaSync must be used within a PanoramaSyncProvider')
  }
  return ctx
}
