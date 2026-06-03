'use client'

import { useRef, useState, useCallback } from 'react'

interface Props {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const THRESHOLD = 70

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el || el.scrollTop > 0) return
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current
    if (!el || el.scrollTop > 0) return
    const dy = e.touches[0].clientY - startY.current
    if (dy <= 0) return
    e.preventDefault()
    setPulling(true)
    setPullDistance(Math.min(dy * 0.5, THRESHOLD + 20))
  }, [])

  const onTouchEnd = useCallback(async () => {
    if (!pulling) return
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      await onRefresh()
      setRefreshing(false)
    }
    setPulling(false)
    setPullDistance(0)
  }, [pulling, pullDistance, onRefresh])

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const showIndicator = pullDistance > 10

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Indicador */}
      {showIndicator && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: pullDistance,
          zIndex: 10, pointerEvents: 'none',
          transition: refreshing ? 'none' : 'height 0.1s',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(180deg,#FFDF00,#c8960c)',
            border: '2px solid #805800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 #805800',
            transform: `scale(${0.5 + progress * 0.5}) rotate(${progress * 180}deg)`,
            transition: refreshing ? 'transform 0.3s linear' : 'none',
            animation: refreshing ? 'spin-refresh 0.8s linear infinite' : 'none',
            fontSize: 18,
          }}>
            {refreshing ? '🔄' : progress >= 1 ? '⬆️' : '⬇️'}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          height: '100%', overflowY: 'auto', overflowX: 'hidden',
          transform: `translateY(${pullDistance}px)`,
          transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes spin-refresh {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}