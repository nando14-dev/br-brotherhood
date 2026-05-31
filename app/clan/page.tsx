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
}

export default function ClanPage() {
  const [clan, setClan] = useState<ClanData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

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

  function roleLabel(role: string) {
    const map: Record<string, string> = {
      leader: '👑 Líder',
      coLeader: '🔱 Co-Líder',
      admin: '⚜️ Ancião',
      member: '🗡️ Membro'
    }
    return map[role] || role
  }

if (loading) return <LoadingScreen />

  return (
    <div style={{ background: '#080A0F', minHeight: '100dvh', color: '#F0EAD6', fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: '0 auto', padding: '20px 16px 100px' }}>

      {/* CLAN HEADER */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#0d1f4a,#1a0d3a)', border: '2px solid #C8973A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, flexShrink: 0 }}>
            🇧🇷
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{clan?.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', marginBottom: 6 }}>{clan?.tag}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,234,214,0.5)', lineHeight: 1.5 }}>{clan?.description}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { val: clan?.members, label: 'Membros' },
            { val: `${clan?.clanLevel}`, label: 'Nível' },
            { val: clan?.warWins, label: 'Guerras' },
            { val: clan?.warLeague?.name?.replace(' League','') || 'Crystal', label: 'Liga' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: '#E8B84B', marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(240,234,214,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MEMBERS */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10 }}>
        👥 Membros — {members.length}/50
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {members.map((m, i) => (
          <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: 'rgba(240,234,214,0.5)', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EAD6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 500 }}>{roleLabel(m.role)}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8B84B' }}>🏆 {m.trophies?.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', fontWeight: 600 }}>⬆️{m.donations} ⬇️{m.donationsReceived}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}