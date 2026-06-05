'use client'

import { useEffect } from 'react'

export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
    if (orientation?.lock) {
      orientation.lock('portrait').catch(() => {})
    }
  }, [])
  return null
}