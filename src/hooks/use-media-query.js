"use client"

import * as React from "react"

export function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    const updateMatches = () => setMatches(media.matches)
    
    // Set initial value
    updateMatches()
    
    // Setup listeners for changes
    media.addEventListener("change", updateMatches)
    
    return () => media.removeEventListener("change", updateMatches)
  }, [query])

  return matches
} 