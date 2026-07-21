import { createContext } from 'react'

// See PanoramaSyncProvider.jsx / usePanoramaSync.js for the actual behavior —
// this file just holds the context object so both can import the same one
// without a component file exporting a non-component (breaks fast refresh).
export const PanoramaSyncContext = createContext(null)
