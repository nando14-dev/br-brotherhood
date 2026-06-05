'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'
import PullToRefresh from '@/components/PullToRefresh'

interface ClanData {
  name: string; tag: string; description: string
  members: number; clanLevel: number; warWins: number
  warLeague?: { name: string }
}
interface Member {
  name: string; tag: string; role: string
  trophies: number; donations: number; donationsReceived: number
}

function roleInfo(role: string) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    leader: { label: 'Líder', bg: '#FFDF00', color: '#3a1000' },
    coLeader: { label: 'Co-Líder', bg: '#f97316', color: '#fff' },
    admin: { label: 'Ancião', bg: '#7a5020', color: '#fff' },
    member: { label: 'Membro', bg: '#888', color: '#fff' },
  }
  return map[role] || { label: role, bg: '#888', color: '#fff' }
}

export default function ClanPage() {
  const [clan, setClan] = useState<ClanData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    try {
      const [cr, mr] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan`),
        fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan/members`)
      ])
      setClan(await cr.json())
      const md = await mr.json()
      setMembers(md.items || [])
    } catch (e) {
      setError('Não foi possível carregar os dados do clã. Tente novamente.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    window.addEventListener('page-refresh', load)
    return () => window.removeEventListener('page-refresh', load)
  }, [])

  if (loading) return <LoadingScreen />

  if (error) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, gap:12 }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <div style={{ fontSize:14, fontWeight:900, color:'#fff', textAlign:'center' }}>{error}</div>
      <button onClick={load} style={{ background:'linear-gradient(180deg,#FFDF00,#c8960c)', border:'none', borderRadius:12, padding:'10px 24px', fontSize:13, fontWeight:900, color:'#3a1000', cursor:'pointer', boxShadow:'0 3px 0 #805800' }}>Tentar novamente</button>
    </div>
  )

  return (
    <PullToRefresh onRefresh={load}>
      <div style={{ padding: '10px 10px 20px' }}>

        {/* CLAN CARD */}
        <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: 12, marginBottom: 10, boxShadow: '0 4px 0 #a07040, 0 6px 16px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#009C3B,#FFDF00,#009C3B)' }} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: 'linear-gradient(135deg,#5a2a08,#3a1000)', border: '3px solid #c8960c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0, boxShadow: '0 4px 0 #805800', position: 'relative' }}>
              🇧🇷
              <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(180deg,#FFDF00,#c8960c)', color: '#3a1000', fontSize: 9, fontWeight: 900, padding: '1px 8px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 2px 0 rgba(0,0,0,0.3)', border: '1px solid #fff' }}>
                Nív. {clan?.clanLevel}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1a0800', lineHeight: 1.1, marginBottom: 3 }}>{clan?.name}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8a6030', marginBottom: 5 }}>{clan?.tag}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5a4020', lineHeight: 1.5 }}>{clan?.description}</div>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#7c2d12,#c2410c)', border: '2px solid #f97316', borderRadius: 10, display: 'flex', overflow: 'hidden', boxShadow: '0 3px 0 #5a1a08' }}>
            {[
              { val: clan?.members, label: 'Membros' },
              { val: clan?.warWins, label: 'Vitórias' },
              { val: clan?.clanLevel, label: 'Nível' },
              { val: clan?.warLeague?.name?.replace(' League', '') || 'Crystal', label: 'Liga' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{s.val}</div>
                <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRIZE */}
        <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 4px 0 #a07040' }}>
          <div style={{ fontSize: 36, flexShrink: 0 }}>🎫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: '#8a6030', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>Prêmio do mês</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1a0800', marginBottom: 2 }}>Season Pass</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#5a4020' }}>Melhor do mês leva o passe pago pelo clã!</div>
          </div>
          <div style={{ background: 'rgba(160,112,64,0.15)', border: '1.5px solid #c8a870', borderRadius: 20, padding: '4px 10px', fontSize: 9, fontWeight: 900, color: '#8a6030', textTransform: 'uppercase', flexShrink: 0 }}>Em breve</div>
        </div>

        {/* MEMBERS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>👥 Membros — {members.length}/50</div>
          <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,#c8960c,transparent)', borderRadius: 1 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {members.map((m, i) => {
            const role = roleInfo(m.role)
            const isLeader = m.role === 'leader'
            const rankColors = ['linear-gradient(180deg,#e87030,#b84010)', 'linear-gradient(180deg,#9090b0,#6070a0)', 'linear-gradient(180deg,#c09050,#906030)']
            return (
              <div key={m.tag} style={{
                background: isLeader ? 'linear-gradient(180deg,#fff8d0,#f5e070)' : 'linear-gradient(180deg,#f0e4cc,#e0d0a8)',
                border: `2px solid ${isLeader ? '#c8960c' : '#c0a060'}`,
                borderRadius: 12, padding: '8px 10px',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: isLeader ? '0 3px 0 #805800' : '0 3px 0 #a07040',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: i < 3 ? rankColors[i] : 'linear-gradient(180deg,#888,#666)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }}>{i + 1}</div>
                <div style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚔️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: isLeader ? '#5a2a00' : '#1a0800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{ fontSize: 8, fontWeight: 900, padding: '1px 5px', borderRadius: 5, textTransform: 'uppercase', background: role.bg, color: role.color }}>{role.label}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.08)', borderRadius: 8, padding: '2px 6px' }}>
                    <span>🏆</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#3a1000' }}>{m.trophies?.toLocaleString('pt-BR')}</span>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#888', marginTop: 2 }}>🎁 {m.donations} · 📥 {m.donationsReceived}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PullToRefresh>
  )
}