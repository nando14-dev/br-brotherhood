'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

interface ClanData {
  name: string
  tag: string
  description: string
  members: number
  clanLevel: number
  warWins: number
  warLeague?: { name: string }
}

interface Member {
  name: string
  tag: string
  role: string
  trophies: number
  donations: number
  donationsReceived: number
  townHallLevel: number
}

function roleLabel(role: string) {
  const map: Record<string, { label: string; color: string }> = {
    leader:   { label: '👑 Líder',     color: '#FFDF00' },
    coLeader: { label: '🔱 Co-Líder',  color: '#FF9A3C' },
    admin:    { label: '⚜️ Ancião',    color: '#60A5FA' },
    member:   { label: '🗡️ Membro',   color: 'rgba(240,244,255,0.4)' },
  }
  return map[role] || { label: role, color: 'rgba(240,244,255,0.4)' }
}

export default function ClanPage() {
  const [clan, setClan] = useState<ClanData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      try {
        const [clanRes, membersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan`),
          fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan/members`)
        ])
        const clanData = await clanRes.json()
        const membersData = await membersRes.json()
        setClan(clanData)
        setMembers(membersData.items || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <div style={{ padding: '16px 16px 100px' }}>

      {/* CLAN HERO CARD */}
      <div className="animate-bounce-in" style={{
        background: 'linear-gradient(135deg, #162440 0%, #1C3A5E 100%)',
        borderRadius: 20,
        border: '2px solid rgba(0,156,59,0.3)',
        padding: 16,
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        {/* Glow verde no fundo */}
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(0,156,59,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Glow amarelo */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(255,223,0,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
          {/* Badge do clã */}
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'linear-gradient(135deg, #0A1628, #162440)',
            border: '2px solid rgba(255,223,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(255,223,0,0.1)',
            position: 'relative',
          }}>
            🇧🇷
            <div style={{
              position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #FFDF00, #C8A800)',
              color: '#0A1628', fontWeight: 900, fontSize: 9,
              padding: '2px 8px', borderRadius: 10,
              whiteSpace: 'nowrap', letterSpacing: 0.5,
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            }}>NÍV. {clan?.clanLevel}</div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: 0.5, lineHeight: 1.1, marginBottom: 4 }}>{clan?.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,244,255,0.35)', letterSpacing: 1, marginBottom: 8 }}>{clan?.tag}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,244,255,0.55)', lineHeight: 1.6, fontWeight: 600 }}>{clan?.description}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { val: clan?.members, label: 'Membros', icon: '👥' },
            { val: clan?.warWins, label: 'Guerras', icon: '⚔️' },
            { val: clan?.clanLevel, label: 'Nível', icon: '⭐' },
            { val: clan?.warLeague?.name?.replace(' League','') || 'Crystal', label: 'Liga', icon: '🏆' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 12, padding: '8px 6px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 14, color: '#FFDF00', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'rgba(240,244,255,0.35)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MEMBERS LABEL */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10,
      }}>
        <div style={{ fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(240,244,255,0.4)' }}>
          👥 Membros — {members.length}/50
        </div>
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg, rgba(0,156,59,0.4), transparent)', borderRadius: 1 }} />
      </div>

      {/* MEMBERS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {members.map((m, i) => {
          const role = roleLabel(m.role)
          const isLeader = m.role === 'leader'
          return (
            <div key={m.tag} className="animate-slide-up" style={{
              animationDelay: `${i * 0.03}s`,
              display: 'flex', alignItems: 'center', gap: 10,
              background: isLeader
                ? 'linear-gradient(90deg, rgba(255,223,0,0.08), rgba(22,36,64,0.8))'
                : 'rgba(22,36,64,0.8)',
              borderRadius: 14,
              border: `1.5px solid ${isLeader ? 'rgba(255,223,0,0.25)' : 'rgba(255,255,255,0.07)'}`,
              padding: '10px 12px',
              boxShadow: isLeader ? '0 4px 12px rgba(255,223,0,0.08)' : '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {/* Rank */}
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: i < 3
                  ? `linear-gradient(135deg, ${['#FFD700,#B8860B', '#C0C0C0,#808080', '#CD7F32,#8B4513'][i]})`
                  : 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 11,
                color: i < 3 ? '#fff' : 'rgba(240,244,255,0.4)',
                flexShrink: 0,
              }}>{i + 1}</div>

              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #1C2E4A, #162440)',
                border: `1.5px solid ${isLeader ? 'rgba(255,223,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>⚔️</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#F0F4FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: role.color, marginTop: 1 }}>{role.label}</div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: '#FFDF00' }}>🏆 {m.trophies?.toLocaleString('pt-BR')}</div>
                <div style={{ fontSize: 9, color: 'rgba(240,244,255,0.35)', fontWeight: 700, marginTop: 1 }}>⬆️{m.donations} ⬇️{m.donationsReceived}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}