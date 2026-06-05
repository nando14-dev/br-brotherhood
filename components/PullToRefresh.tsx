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
            position: 'relative', width: 44, height: 44,
            transform: `scale(${0.4 + progress * 0.6})`,
            transition: refreshing ? 'none' : 'transform 0.1s',
          }}>
            {/* Anel dourado */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#c8960c',
              borderRightColor: '#FFDF00',
              boxShadow: '0 0 12px rgba(200,150,0,0.35)',
              transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
              animation: refreshing ? 'ptr-spin 0.8s linear infinite' : 'none',
              transition: refreshing ? 'none' : 'transform 0.1s',
            }} />
            {/* Badge central */}
            <div style={{
              position: 'absolute', inset: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#3a1000,#5a2a00)',
              border: '2px solid #c8960c',
              overflow: 'hidden',
              boxShadow: '0 0 8px rgba(200,150,0,0.2)',
              animation: refreshing ? 'ptr-pulse 1s ease infinite alternate' : 'none',
            }}>
              <img src="/dragon.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
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
        @keyframes ptr-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes ptr-pulse {
          from { box-shadow: 0 0 6px rgba(200,150,0,0.2); }
          to   { box-shadow: 0 0 18px rgba(200,150,0,0.55); }
        }
      `}</style>
    </div>
  )
}