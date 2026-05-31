'use client'

import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

interface WarMember {
  name: string
  tag: string
  attacks?: {
    stars: number
    destructionPercentage: number
  }[]
  opponentAttacks: number
}

interface WarData {
  state: string
  teamSize: number
  startTime: string
  endTime: string
  clan: {
    name: string
    stars: number
    destructionPercentage: number
    attacks: number
    members: WarMember[]
  }
  opponent: {
    name: string
    stars: number
    destructionPercentage: number
    attacks: number
  }
}

export default function GuerraPage() {
  const [war, setWar] = useState<WarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [nudged, setNudged] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan/currentwar`)
        const data = await res.json()
        setWar(data)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  function sendNudge(tag: string, name: string) {
    setNudged(prev => new Set([...prev, tag]))
  }

  if (loading) return <LoadingScreen />

  if (!war || war.state === 'notInWar') return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(240,234,214,0.4)', fontFamily: 'Cinzel, serif' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
      <div>Nenhuma guerra em andamento</div>
    </div>
  )

  const pending = war.clan.members.filter(m => !m.attacks || m.attacks.length < 2)
  const attacked = war.clan.members.filter(m => m.attacks && m.attacks.length > 0)

  function timeLeft(endTime: string) {
    const end = new Date(endTime.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'))
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 'Encerrada'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}min`
  }

  const barWidth = Math.round((war.clan.stars / Math.max(war.clan.stars + war.opponent.stars, 1)) * 100)

  return (
    <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* WAR HERO */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 9, fontWeight: 700, color: '#E74C3C', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E74C3C', animation: 'pulse 1s infinite' }} />
          {war.state === 'inWar' ? 'AO VIVO' : war.state === 'preparation' ? 'PREPARAÇÃO' : 'ENCERRADA'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>🇧🇷 {war.clan.name}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#E8B84B', textShadow: '0 0 20px rgba(200,151,58,0.25)' }}>{war.clan.stars}⭐</div>
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'rgba(240,234,214,0.3)', letterSpacing: 2 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{war.opponent.name}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#3a4a5a' }}>{war.opponent.stars}⭐</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 5, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #C8973A, #FF6B1A)', borderRadius: 20, width: `${barWidth}%`, transition: 'width 1.5s ease', boxShadow: '0 0 6px rgba(200,151,58,0.4)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)' }}>
          <span>{war.clan.attacks}/{war.teamSize * 2} ataques</span>
          <span>⏱ {war.state === 'inWar' ? timeLeft(war.endTime) : '—'}</span>
          <span>{war.opponent.attacks}/{war.teamSize * 2} ataques</span>
        </div>
      </div>

      {/* PENDENTES */}
      {pending.length > 0 && <>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Ataques pendentes
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,151,58,0.25), transparent)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {pending.map(m => (
            <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>⚔️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EAD6' }}>{m.name}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#E74C3C', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.18)', borderRadius: 6, padding: '1px 6px', display: 'inline-block', marginTop: 2 }}>
                  ⚠️ {!m.attacks || m.attacks.length === 0 ? 'Não atacou' : '1 ataque restando'}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8, flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: m.attacks?.length ? '#E8B84B' : 'rgba(240,234,214,0.3)' }}>
                  {m.attacks?.length ? `${'⭐'.repeat(m.attacks[0].stars)}` : '—'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', fontWeight: 600 }}>
                  {m.attacks?.length ? `${m.attacks[0].destructionPercentage.toFixed(0)}%` : '2 restantes'}
                </div>
              </div>
              <button
                onClick={() => sendNudge(m.tag, m.name)}
                style={{
                  background: nudged.has(m.tag) ? 'rgba(46,204,113,0.08)' : 'rgba(124,58,237,0.1)',
                  border: `1px solid ${nudged.has(m.tag) ? 'rgba(46,204,113,0.25)' : 'rgba(124,58,237,0.25)'}`,
                  borderRadius: 9, padding: '7px 10px',
                  fontSize: 10, fontWeight: 700,
                  color: nudged.has(m.tag) ? '#2ECC71' : '#a78bfa',
                  cursor: nudged.has(m.tag) ? 'default' : 'pointer',
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
                }}
              >
                <span style={{ fontSize: 15 }}>{nudged.has(m.tag) ? '✅' : '👋'}</span>
                <span>{nudged.has(m.tag) ? 'Enviado' : 'Cutucar'}</span>
              </button>
            </div>
          ))}
        </div>
      </>}

      {/* JÁ ATACARAM */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        ✅ Ataques realizados
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(200,151,58,0.25), transparent)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {attacked.map(m => (
          <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>⚔️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EAD6' }}>{m.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 500 }}>{m.attacks!.length}/2 ataques</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, color: '#E8B84B' }}>{'⭐'.repeat(Math.max(...m.attacks!.map(a => a.stars)))}</div>
              <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', fontWeight: 600 }}>{Math.max(...m.attacks!.map(a => a.destructionPercentage)).toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }`}</style>
    </div>
  )
}