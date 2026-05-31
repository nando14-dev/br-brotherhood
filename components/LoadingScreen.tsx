'use client'

import { useEffect, useState } from 'react'

export default function LoadingScreen() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 300)
    return () => clearInterval(interval)
  }, [])

  const frames = ['⚔️  🛡️', ' ⚔️ 🛡️', '  ⚔️🛡️', ' ⚔️ 🛡️']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#080A0F',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, gap: 20
    }}>
      <div style={{ fontSize: 48, letterSpacing: -8, transition: 'all 0.2s' }}>
        {frames[frame]}
      </div>
      <div style={{
        fontFamily: 'Cinzel, serif', fontSize: 13,
        color: 'rgba(240,234,214,0.4)', letterSpacing: 3,
        textTransform: 'uppercase'
      }}>
        Carregando...
      </div>
      <div style={{
        width: 120, height: 2, background: 'rgba(255,255,255,0.06)',
        borderRadius: 1, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #C8973A, #FF6B1A)',
          borderRadius: 1,
          animation: 'loading-bar 1.5s ease infinite',
        }} />
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}