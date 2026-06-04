'use client'

import { useRouter, usePathname } from 'next/navigation'
import EmberBackground from '@/components/EmberBackground'
import Header from '@/components/Header'
import { useRef, useState, useEffect } from 'react'
import ReleaseNotes from '@/components/ReleaseNotes'

const TABS = [
  {
    href: '/clan', label: 'Clã', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  },
  {
    href: '/clan/streak', label: 'Streak', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M12 2c0 0-6 6-6 11a6 6 0 0012 0c0-5-6-11-6-11z" />
        <path d="M12 12c0 0-3 2-3 4a3 3 0 006 0c0-2-3-4-3-4z" />
      </svg>
    )
  },
  {
    href: '/clan/guerra', label: 'Guerra', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6 2 2-1 1" />
        <path d="M19 13l2-2-4-4-2 2" />
        <path d="M3 21l7-7" />
      </svg>
    ), badge: true
  },
  {
    href: '/clan/comunidade', label: 'Comunidade', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    )
  },
]

const HIDE_HEADER = ['/clan/perfil', '/clan/onboarding']

export default function ClanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const hideHeader = HIDE_HEADER.includes(pathname)
  const currentIdx = TABS.findIndex(t => t.href === pathname)
  const lastTapRef = useRef<{ href: string; time: number } | null>(null)

  function handleNavTap(href: string) {
    const now = Date.now()
    const last = lastTapRef.current
    if (last && last.href === href && now - last.time < 350) {
      lastTapRef.current = null
      router.refresh()
      return
    }
    lastTapRef.current = { href, time: now }
    router.push(href)
  }

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      height: '100dvh',
      background: '#c8b898',
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Fundo textura */}
      <div style={{
        position: 'fixed', inset: 0, maxWidth: 430,
        background: 'linear-gradient(180deg, #5a3a18 0%, #3d2510 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {!hideHeader && <Header />}
      <ReleaseNotes />

      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', minHeight: 0 }}>
        {children}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{
        background: 'linear-gradient(180deg, #4a2a0a 0%, #3a1e06 100%)',
        borderTop: '3px solid #a07040',
        display: 'flex', padding: '6px 4px 14px', gap: 0,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.6)',
        flexShrink: 0, zIndex: 10,
        position: 'relative',
      }}>
        {TABS.map((tab, i) => {
          const active = pathname === tab.href
          return (
            <button key={tab.href} onClick={() => handleNavTap(tab.href)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer', padding: '4px 2px', borderRadius: 12, border: 'none',
              background: 'transparent', gap: 2,
              transform: active ? 'scale(1.08)' : 'scale(0.82)',
              opacity: active ? 1 : 0.5,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'linear-gradient(180deg, #FFDF00, #c8960c)' : 'transparent',
                boxShadow: active ? '0 4px 0 #805800, 0 0 16px rgba(255,223,0,0.35)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                color: active ? '#3a1000' : 'rgba(255,255,255,0.35)',
                position: 'relative',
              }}>
                {tab.icon}
                {tab.badge && (
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 15, height: 15, borderRadius: '50%',
                    background: '#E74C3C', border: '2px solid #0d0702',
                    fontSize: 7, fontWeight: 900, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>3</div>
                )}
              </div>
              <span style={{
                fontSize: 8, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.5px', fontFamily: 'Nunito, sans-serif',
                color: active ? '#FFDF00' : 'rgba(255,255,255,0.3)',
                maxHeight: active ? 20 : 0, overflow: 'hidden',
                opacity: active ? 1 : 0,
                transition: 'all 0.25s ease',
              }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}