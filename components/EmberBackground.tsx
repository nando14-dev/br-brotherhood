'use client'

import { useEffect, useRef } from 'react'

export default function EmberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const embers: any[] = []
    const colors = ['#FF6B1A', '#FF9A3C', '#FFD166', '#FF4500', '#C8973A']

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function createEmber() {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 10,
        size: Math.random() * 2.5 + 1,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.65 + 0.25,
        life: 0,
        maxLife: Math.random() * 220 + 150,
        color: colors[Math.floor(Math.random() * colors.length)]
      }
    }

    for (let i = 0; i < 45; i++) {
      const e = createEmber()
      e.y = Math.random() * canvas.height
      e.life = Math.random() * e.maxLife
      embers.push(e)
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      embers.forEach((e, i) => {
        e.life++
        e.y -= e.speedY
        e.x += e.speedX + Math.sin(e.life * 0.03) * 0.25
        const p = e.life / e.maxLife
        const alpha = p < 0.1 ? p * 10 * e.opacity : p > 0.8 ? (1 - p) * 5 * e.opacity : e.opacity
        ctx!.beginPath()
        ctx!.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx!.fillStyle = e.color
        ctx!.globalAlpha = Math.max(0, alpha)
        ctx!.fill()
        ctx!.globalAlpha = 1
        if (e.life >= e.maxLife || e.y < -10) embers[i] = createEmber()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, width: '100%', height: '100%' }}
    />
  )
}