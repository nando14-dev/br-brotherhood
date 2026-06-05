'use client'

import { useEffect } from 'react'

export default function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
    if (screen.orientation?.lock) {
      screen.orientation.lock('portrait').catch(() => {})
    }
  }, [])
  return null
}