'use client'

import { usePathname, useRouter } from 'next/navigation'
import EmberBackground from '@/components/EmberBackground'
import Header from '@/components/Header'

export default function ClanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { href: '/clan', icon: '🛡️', label: 'Clã' },
    { href: '/clan/streak', icon: '🔥', label: 'Streak' },
    { href: '/clan/guerra', icon: '⚔️', label: 'Guerra' },
    { href: '/clan/comunidade', icon: '🌐', label: 'Comunidade' },
  ]

  return (
    <div style={{ background: '#080A0F', minHeight: '100dvh', maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <EmberBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        {children}
      </div>
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: 'rgba(8,10,15,0.96)',
        backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', padding: '8px 12px 16px', gap: 4, zIndex: 200
      }}>
        {tabs.map(tab => {
          const active = pathname === tab.href
          return (
            <button key={tab.href} onClick={() => router.push(tab.href)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              cursor: 'pointer', padding: '6px 4px', borderRadius: 12, border: 'none',
              background: active ? 'rgba(200,151,58,0.07)' : 'transparent',
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: active ? '#E8B84B' : 'rgba(240,234,214,0.4)' }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}