'use client'

import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

interface WarMember {
  name: string
  tag: string
  attacks?: { stars: number; destructionPercentage: number }[]
}

interface WarData {
  state: string
  teamSize: number
  startTime: string
  endTime: string
  clan: { name: string; stars: number; destructionPercentage: number; attacks: number; members: WarMember[] }
  opponent: { name: string; stars: number; destructionPercentage: number; attacks: number }
}

interface CWLGroup {
  state: string
  season: string
  clans: { name: string; tag: string; stars: number }[]
  rounds: { warTags: string[] }[]
}

export default function GuerraPage() {
  const [mode, setMode] = useState<'loading'|'regular'|'cwl'|'none'>('loading')
  const [war, setWar] = useState<WarData | null>(null)
  const [cwl, setCwl] = useState<CWLGroup | null>(null)
  const [cwlWar, setCwlWar] = useState<WarData | null>(null)
  const [nudged, setNudged] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const proxy = process.env.NEXT_PUBLIC_PROXY_URL
      const warRes = await fetch(`${proxy}/clan/currentwar`)
      const warData = await warRes.json()
      if (warData.state && warData.state !== 'notInWar') {
        setWar(warData); setMode('regular'); return
      }
      try {
        const cwlRes = await fetch(`${proxy}/clan/cwl`)
        const cwlData = await cwlRes.json()
        if (cwlData.state && cwlData.clans) {
          setCwl(cwlData)

          // Varre TODOS os rounds e prioriza inWar > warEnded > preparation
          const rounds = cwlData.rounds || []
          let foundWar: any = null

          for (let i = 0; i < rounds.length; i++) {
            const tags = rounds[i].warTags.filter((t: string) => t !== '#0')
            for (const tag of tags) {
              try {
                const encoded = tag.replace('#', '%23')
                const wRes = await fetch(`${proxy}/clan/cwl/war/${encoded}`)
                const wData = await wRes.json()

                if (wData.clan?.tag === '#P9P2RRG' || wData.opponent?.tag === '#P9P2RRG') {
                  if (wData.opponent?.tag === '#P9P2RRG') {
                    const tmp = wData.clan
                    wData.clan = wData.opponent
                    wData.opponent = tmp
                  }
                  // Prioriza: inWar > warEnded > preparation > qualquer outro
                  if (!foundWar) {
                    foundWar = wData
                  } else if (wData.state === 'inWar') {
                    foundWar = wData
                  } else if (wData.state === 'warEnded' && foundWar.state !== 'inWar') {
                    foundWar = wData
                  }
                }
              } catch(e) { console.error(e) }
            }
          }

          if (foundWar) setCwlWar(foundWar)
          setMode('cwl'); return
        }
      } catch(e) { console.error(e) }
      setMode('none')
    }
    load()
  }, [])

  function sendNudge(tag: string) { setNudged(prev => new Set([...prev, tag])) }

  function timeLeft(endTime: string) {
    const end = new Date(endTime.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'))
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 'Encerrada'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}min`
  }

  const nudgeBtn = (tag: string, name: string) => (
    <button onClick={() => sendNudge(tag)} style={{
      background: nudged.has(tag) ? 'linear-gradient(180deg,#6ee54a,#22aa1a)' : 'linear-gradient(180deg,#a78bfa,#7c3aed)',
      border: 'none', borderRadius: 8, padding: '8px 12px',
      fontSize: 11, fontWeight: 900, color: '#fff',
      cursor: nudged.has(tag) ? 'default' : 'pointer',
      flexShrink: 0, letterSpacing: '0.5px',
      textTransform: 'uppercase' as const,
      boxShadow: nudged.has(tag) ? '0 3px 0 #0a5208' : '0 3px 0 #3730a3',
      whiteSpace: 'nowrap' as const,
    }}>
      {nudged.has(tag) ? 'Enviado ✓' : 'Cutucar'}
    </button>
  )

  const sectionHdr = (title: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'4px 0 8px' }}>
      <div style={{ fontSize:12, fontWeight:900, color:'#3a1000', textTransform:'uppercase', letterSpacing:'0.5px' }}>{title}</div>
      <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
    </div>
  )

  const memberRow = (m: WarMember, pending: boolean) => (
    <div key={m.tag} style={{
      background: pending ? 'linear-gradient(180deg,#fff3e0,#ffe0b8)' : 'linear-gradient(180deg,#f0e4cc,#e0d0a8)',
      border: `2px solid ${pending ? '#f97316' : '#c0a060'}`,
      borderRadius: 12, padding: '8px 10px',
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 6,
      boxShadow: pending ? '0 3px 0 #c2410c' : '0 3px 0 #a07040',
    }}>
      <div style={{ width:42, height:42, borderRadius:10, background:'linear-gradient(135deg,#2a4a8a,#4a2a8a)', border:'2px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>⚔️</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:900, color:'#1a0800' }}>{m.name}</div>
        {pending
          ? <span style={{ fontSize:8, fontWeight:900, padding:'1px 5px', borderRadius:5, textTransform:'uppercase', background:'#f97316', color:'#fff' }}>Não atacou</span>
          : <div style={{ fontSize:10, fontWeight:700, color:'#8a6030' }}>{m.attacks?.length}/2 ataques</div>
        }
      </div>
      {!pending && m.attacks && (
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:14, color:'#c8960c' }}>{'⭐'.repeat(Math.max(...m.attacks.map(a=>a.stars)))}</div>
          <div style={{ fontSize:9, fontWeight:800, color:'#8a6030' }}>{Math.max(...m.attacks.map(a=>a.destructionPercentage)).toFixed(0)}%</div>
        </div>
      )}
      {pending && nudgeBtn(m.tag, m.name)}
    </div>
  )

  const warHero = (w: WarData, isCwl = false) => {
    const barWidth = Math.round((w.clan.stars / Math.max(w.clan.stars + w.opponent.stars, 1)) * 100)
    return (
      <div style={{ background:'linear-gradient(180deg,#1a3060,#0f1e40)', border:'2px solid #c8960c', borderRadius:14, padding:14, marginBottom:10, boxShadow:'0 4px 0 #805800', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-10, bottom:-10, fontSize:80, opacity:0.05 }}>⚔️</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(231,76,60,0.2)', border:'1.5px solid #E74C3C', borderRadius:20, padding:'3px 10px', fontSize:9, fontWeight:900, color:'#E74C3C', textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#E74C3C', animation:'blink 1s infinite' }} />
          {w.state === 'inWar' ? 'AO VIVO' : w.state === 'preparation' ? 'PREPARAÇÃO' : 'ENCERRADA'}
          {isCwl && ' · CWL'}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.5)', marginBottom:4, textTransform:'uppercase' }}>🇧🇷 {w.clan.name}</div>
            <div style={{ fontSize:40, fontWeight:900, color:'#FFDF00', textShadow:'0 0 16px rgba(255,223,0,0.4)' }}>{w.clan.stars}⭐</div>
          </div>
          <div style={{ fontSize:18, fontWeight:900, color:'rgba(255,255,255,0.2)', letterSpacing:2 }}>VS</div>
          <div style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.5)', marginBottom:4, textTransform:'uppercase' }}>{w.opponent.name}</div>
            <div style={{ fontSize:40, fontWeight:900, color:'#4a5a6a' }}>{w.opponent.stars}⭐</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:20, height:8, overflow:'hidden', marginBottom:6 }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,#FFDF00,#f97316)', borderRadius:20, width:`${barWidth}%`, boxShadow:'0 0 8px rgba(255,200,0,0.5)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.4)' }}>
          <span>{w.clan.attacks}/{w.teamSize * (isCwl ? 1 : 2)} ataques</span>
          <span>⏱ {w.state === 'inWar' ? timeLeft(w.endTime) : '—'}</span>
          <span>{w.opponent.attacks}/{w.teamSize * (isCwl ? 1 : 2)} ataques</span>
        </div>
      </div>
    )
  }

  if (mode === 'loading') return <LoadingScreen />

  if (mode === 'none') return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#8a6030', fontWeight:900 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🛡️</div>
      <div>Nenhuma guerra em andamento</div>
    </div>
  )

  if (mode === 'cwl') return (
    <div style={{ overflowY:'auto', height:'100%', padding:'10px 10px 20px' }}>
      <div style={{ background:'linear-gradient(135deg,#1a0a3e,#2d1060)', border:'2px solid #9333ea', borderRadius:14, padding:'12px 14px', marginBottom:10, boxShadow:'0 4px 0 #4a0a80' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(124,58,237,0.2)', border:'1px solid #7c3aed', borderRadius:20, padding:'3px 10px', fontSize:9, fontWeight:900, color:'#a78bfa', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#a78bfa', animation:'blink 1s infinite' }} />
          Liga de Guerra de Clãs
        </div>
        <div style={{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:2 }}>Temporada {cwl?.season}</div>
        <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)' }}>{cwl?.clans.length} clãs participando</div>
      </div>

      {cwlWar && cwlWar.state !== 'notInWar' && <>
        {sectionHdr('⚔️ Batalha atual')}
        {warHero(cwlWar, true)}
        {cwlWar.clan.members?.filter(m => !m.attacks || m.attacks.length === 0).length > 0 && <>
          {sectionHdr('⚠️ Não atacaram')}
          {cwlWar.clan.members.filter(m => !m.attacks || m.attacks.length === 0).map(m => memberRow(m, true))}
        </>}
      </>}

      {sectionHdr('🏆 Classificação')}
      {cwl?.clans.sort((a,b) => (b.stars||0)-(a.stars||0)).map((c,i) => (
        <div key={c.tag} style={{ background: c.tag==='#P9P2RRG' ? 'linear-gradient(180deg,#fff8d0,#f5e070)' : 'linear-gradient(180deg,#f0e4cc,#e0d0a8)', border:`2px solid ${c.tag==='#P9P2RRG' ? '#c8960c' : '#c0a060'}`, borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, marginBottom:6, boxShadow: c.tag==='#P9P2RRG' ? '0 3px 0 #805800' : '0 3px 0 #a07040' }}>
          <div style={{ fontSize:16, fontWeight:900, color: i<3 ? '#c8960c' : '#8a6030', width:24, textAlign:'center' }}>{i+1}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:900, color:'#1a0800' }}>{c.name} {c.tag==='#P9P2RRG' ? '🇧🇷' : ''}</div>
          </div>
          <div style={{ fontSize:15, fontWeight:900, color:'#c8960c' }}>{c.stars||0}⭐</div>
        </div>
      ))}
    </div>
  )

  const pending = war!.clan.members.filter(m => !m.attacks || m.attacks.length < 2)
  const attacked = war!.clan.members.filter(m => m.attacks && m.attacks.length > 0)

  return (
    <div style={{ overflowY:'auto', height:'100%', padding:'10px 10px 20px' }}>
      {warHero(war!)}
      {pending.length > 0 && <>{sectionHdr('⚠️ Ataques pendentes')}{pending.map(m => memberRow(m, true))}</>}
      {sectionHdr('✅ Ataques realizados')}
      {attacked.map(m => memberRow(m, false))}
    </div>
  )
}