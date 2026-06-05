'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import LoadingScreen from '@/components/LoadingScreen'
import PullToRefresh from '@/components/PullToRefresh'

type Tab = 'recrutar' | 'forum' | 'news'

interface Post {
  id: string; title: string; content: string
  created_at: string; user_id: string; pinned: boolean
  profiles: { display_name: string; avatar_emoji: string }
}

interface News {
  id: string; tag: string; title: string; body: string
  created_at: string; user_id: string
  profiles: { display_name: string }
}

export default function ComunidadePage() {
  const [tab, setTab] = useState<Tab>('recrutar')
  const [posts, setPosts] = useState<Post[]>([])
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [showNewNews, setShowNewNews] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newNewsTag, setNewNewsTag] = useState('📢 Aviso do Líder')
  const [newNewsTitle, setNewNewsTitle] = useState('')
  const [newNewsBody, setNewNewsBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [clanRole, setClanRole] = useState('member')
  const [userId, setUserId] = useState('')
  const [flagTaps, setFlagTaps] = useState(0)
  const supabase = createClient()

  const isAdmin = clanRole === 'leader' || clanRole === 'coLeader'

  async function handleRefresh() {
    if (tab === 'forum') await loadPosts()
    else if (tab === 'news') await loadNews()
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  function handleFlagTap() {
    const next = flagTaps + 1
    setFlagTaps(next)
    if (next >= 10) {
      window.dispatchEvent(new Event('force-release-notes'))
      setFlagTaps(0)
      if (typeof window !== 'undefined') {
        const seen: string[] = JSON.parse(localStorage.getItem('brb_seen_ach') || '[]')
        localStorage.setItem('found_flag', 'true')
        if (!seen.includes('historian')) {
          const count = parseInt(localStorage.getItem('brb_ach_badge') || '0') + 1
          localStorage.setItem('brb_ach_badge', String(count))
          window.dispatchEvent(new Event('achievement-badge-update'))
        }
      }
    } else {
      setTimeout(() => setFlagTaps(0), 3000)
    }
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('clan_role').eq('id', user.id).single()
      if (profile?.clan_role) setClanRole(profile.clan_role)
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (tab === 'forum') loadPosts()
    if (tab === 'news') loadNews()
  }, [tab])

  useEffect(() => {
    function onRefresh() {
      if (tab === 'forum') loadPosts()
      else if (tab === 'news') loadNews()
      else { setLoading(true); setTimeout(() => setLoading(false), 400) }
    }
    window.addEventListener('page-refresh', onRefresh)
    return () => window.removeEventListener('page-refresh', onRefresh)
  }, [tab])

  async function loadPosts() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('forum_posts')
      .select('*, profiles(display_name, avatar_emoji)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30)
    if (err) setError('Erro ao carregar posts. Tente novamente.')
    if (data) setPosts(data as any)
    setLoading(false)
  }

  async function togglePin(p: Post) {
    if (!isAdmin) return
    if (!p.pinned) {
      const pinnedCount = posts.filter(x => x.pinned).length
      if (pinnedCount >= 2) { showToast('⚠️ Máximo de 2 posts pinnados'); return }
    }
    await supabase.from('forum_posts').update({ pinned: !p.pinned }).eq('id', p.id)
    loadPosts()
  }

  async function loadNews() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.from('clan_news').select('*, profiles(display_name)').order('created_at', { ascending: false }).limit(30)
    if (err) setError('Erro ao carregar news. Tente novamente.')
    if (data) setNews(data as any)
    setLoading(false)
  }

  async function savePost() {
    if (!newTitle.trim() || !newContent.trim()) { showToast('⚠️ Preencha título e conteúdo'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('forum_posts').insert({ title: newTitle.trim(), content: newContent.trim(), user_id: user.id })
    setNewTitle(''); setNewContent(''); setShowNewPost(false); setSaving(false)
    showToast('✦ Post publicado!')
    loadPosts()
  }

  async function deletePost(id: string) {
    await supabase.from('forum_posts').delete().eq('id', id)
    showToast('🗑️ Post removido')
    loadPosts()
  }

  async function saveNews() {
    if (!newNewsTitle.trim() || !newNewsBody.trim()) { showToast('⚠️ Preencha todos os campos'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('clan_news').insert({ tag: newNewsTag, title: newNewsTitle.trim(), body: newNewsBody.trim(), user_id: user.id })
    setNewNewsTitle(''); setNewNewsBody(''); setShowNewNews(false); setSaving(false)
    showToast('✦ News publicada!')
    loadNews()
  }

  async function deleteNews(id: string) {
    if (!isAdmin) return
    await supabase.from('clan_news').delete().eq('id', id)
    showToast('🗑️ News removida')
    loadNews()
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const d = Math.floor(diff / 86400000)
    const h = Math.floor(diff / 3600000)
    if (d > 0) return `${d}d atrás`
    if (h > 0) return `${h}h atrás`
    return 'agora'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.6)',
    border: '2px solid #c0a060',
    borderRadius: 8, padding: '10px 12px',
    color: '#1a0800', fontFamily: "'Nunito', sans-serif",
    fontSize: 13, fontWeight: 700, outline: 'none', marginBottom: 8,
  }

  const sectionHdr = (title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px' }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#3a1000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,#c8960c,transparent)', borderRadius: 1 }} />
    </div>
  )

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div style={{ padding: '10px 10px 20px', position: 'relative' }}>

      {/* EASTER EGG — bandeirinha invisível no canto */}
      <div
        onClick={handleFlagTap}
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 50,
          width: 36, height: 36,
          cursor: 'pointer', userSelect: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {flagTaps > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: '#E74C3C', border: '2px solid #f5ead8',
            fontSize: 8, fontWeight: 900, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bounce-in 0.2s ease',
          }}>{flagTaps}</div>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '2px solid #c0a060', boxShadow: '0 3px 0 #a07040' }}>
        {(['recrutar', 'forum', 'news'] as Tab[]).map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 4px', textAlign: 'center',
            fontSize: 10, fontWeight: 900, cursor: 'pointer',
            background: tab === t ? 'linear-gradient(180deg,#FFDF00,#c8960c)' : 'linear-gradient(180deg,#e8d8b8,#d8c8a0)',
            color: tab === t ? '#3a1000' : '#8a6030',
            borderRight: i < 2 ? '1px solid #c0a060' : 'none',
            border: 'none', textTransform: 'uppercase', letterSpacing: '0.3px',
            transition: 'all 0.15s',
          }}>
            {t === 'recrutar' ? '📣 Recrutar' : t === 'forum' ? '💬 Fórum' : '📰 News'}
          </button>
        ))}
      </div>

      {/* RECRUTAR */}
      {tab === 'recrutar' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg,#0f4a1a,#1a6030)', border: '2px solid #22c55e', borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: '0 4px 0 #0a3010' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>🇧🇷 Junte-se ao clã</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 14 }}>Um dos clãs mais tradicionais do Brasil. Respeito, amizade e conquistas desde janeiro de 2016.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[{ v: '9', l: 'Anos' }, { v: '39', l: 'Membros' }, { v: '827', l: '★ War' }].map(s => (
                <div key={s.l} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#86efac', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => {
              const text = '🇧🇷 *BR Brotherhood* — clã top do Brasil!\n\n⚔️ TH13+\n🏆 Ranking mensal · Season Pass de prêmio\n🔥 App exclusivo do clã\n\n👉 Tag: #P9P2RRG'
              if (navigator.share) navigator.share({ text })
              else { navigator.clipboard?.writeText(text); showToast('📋 Texto copiado!') }
            }} style={{ width: '100%', background: 'linear-gradient(180deg,#6ee54a,#22aa1a)', border: 'none', borderRadius: 12, padding: 13, fontSize: 13, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 0 #0a5208', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>📤</span> Compartilhar no WhatsApp
            </button>
          </div>

          {sectionHdr('Requisitos')}
          <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: '14px 16px', boxShadow: '0 3px 0 #a07040' }}>
            {[['🏠', 'Town Hall 13 ou superior'], ['⚔️', 'Participar das guerras'], ['🇧🇷', 'Falar português'], ['❤️', 'Respeito acima de tudo']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(160,112,64,0.2)' }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1, color: '#3a1000' }}>{label}</span>
                <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 16 }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORUM */}
      {tab === 'forum' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={() => setShowNewPost(!showNewPost)} style={{ background: showNewPost ? 'linear-gradient(180deg,#f87171,#dc2626)' : 'linear-gradient(180deg,#FFDF00,#c8960c)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 900, color: showNewPost ? '#fff' : '#3a1000', cursor: 'pointer', boxShadow: showNewPost ? '0 3px 0 #7f1d1d' : '0 3px 0 #805800' }}>
              {showNewPost ? '✕ Cancelar' : '+ Novo tópico'}
            </button>
          </div>

          {showNewPost && (
            <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: '0 3px 0 #a07040' }}>
              <input placeholder="Título do tópico" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} />
              <textarea placeholder="Conteúdo..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              <button onClick={savePost} disabled={saving} style={{ width: '100%', background: 'linear-gradient(180deg,#FFDF00,#c8960c)', border: 'none', borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 900, color: '#3a1000', cursor: 'pointer', boxShadow: '0 3px 0 #805800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {saving ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          )}

          {error ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'#dc2626', fontWeight:900, fontSize:13 }}>{error}</div>
          ) : loading ? <LoadingScreen /> : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a6030' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 13, fontWeight: 900 }}>Nenhum tópico ainda</div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Seja o primeiro a postar!</div>
            </div>
          ) : posts.map(p => (
            <div key={p.id} style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: 14, marginBottom: 8, boxShadow: '0 3px 0 #a07040', position: 'relative' }}>
              {p.pinned && (
                <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 16, lineHeight: 1 }}>📌</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {p.profiles?.avatar_emoji || '⚔️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#3a1000' }}>{p.profiles?.display_name || 'Membro'}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#8a6030' }}>{timeAgo(p.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {isAdmin && (
                    <button onClick={() => togglePin(p)} style={{ background: p.pinned ? 'linear-gradient(180deg,#FFDF00,#c8960c)' : 'linear-gradient(180deg,#e8d8b8,#d8c8a0)', border: `1px solid ${p.pinned ? '#805800' : '#c0a060'}`, borderRadius: 7, padding: '4px 7px', fontSize: 13, cursor: 'pointer', boxShadow: p.pinned ? '0 2px 0 #805800' : '0 2px 0 #a07040' }} title={p.pinned ? 'Despinnar' : 'Pinnar'}>📌</button>
                  )}
                  {(isAdmin || p.user_id === userId) && (
                    <button onClick={() => deletePost(p.id)} style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#dc2626', cursor: 'pointer', fontWeight: 900 }}>🗑️</button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#1a0800', marginBottom: 5, lineHeight: 1.4, paddingRight: p.pinned ? 28 : 0 }}>{p.title}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5a4020', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* NEWS */}
      {tab === 'news' && (
        <div>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button onClick={() => setShowNewNews(!showNewNews)} style={{ background: showNewNews ? 'linear-gradient(180deg,#f87171,#dc2626)' : 'linear-gradient(180deg,#FFDF00,#c8960c)', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 900, color: showNewNews ? '#fff' : '#3a1000', cursor: 'pointer', boxShadow: showNewNews ? '0 3px 0 #7f1d1d' : '0 3px 0 #805800' }}>
                {showNewNews ? '✕ Cancelar' : '+ Nova news'}
              </button>
            </div>
          )}

          {showNewNews && isAdmin && (
            <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: '0 3px 0 #a07040' }}>
              <select value={newNewsTag} onChange={e => setNewNewsTag(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>📢 Aviso do Líder</option>
                <option>🏆 Resultado</option>
                <option>🎉 Novo membro</option>
                <option>⚔️ Guerra</option>
                <option>📣 Recrutamento</option>
              </select>
              <input placeholder="Título da news" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} style={inputStyle} />
              <textarea placeholder="Conteúdo..." value={newNewsBody} onChange={e => setNewNewsBody(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              <button onClick={saveNews} disabled={saving} style={{ width: '100%', background: 'linear-gradient(180deg,#FFDF00,#c8960c)', border: 'none', borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 900, color: '#3a1000', cursor: 'pointer', boxShadow: '0 3px 0 #805800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {saving ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          )}

          {error ? (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'#dc2626', fontWeight:900, fontSize:13 }}>{error}</div>
          ) : loading ? <LoadingScreen /> : news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8a6030' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
              <div style={{ fontSize: 13, fontWeight: 900 }}>Nenhuma news ainda</div>
              {isAdmin && <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Publique a primeira news do clã!</div>}
            </div>
          ) : news.map(n => (
            <div key={n.id} style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8a870', borderRadius: 14, padding: 14, marginBottom: 8, boxShadow: '0 3px 0 #a07040', position: 'relative' }}>
              {isAdmin && (
                <button onClick={() => deleteNews(n.id)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#dc2626', cursor: 'pointer', fontWeight: 900 }}>🗑️</button>
              )}
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: '#c8960c', marginBottom: 6 }}>{n.tag}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#1a0800', marginBottom: 6, lineHeight: 1.3, paddingRight: isAdmin ? 40 : 0 }}>{n.title}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5a4020', lineHeight: 1.6 }}>{n.body}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8a6030', marginTop: 8 }}>{n.profiles?.display_name} · {timeAgo(n.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', border: '2px solid #c8960c', borderRadius: 20, padding: '10px 20px', fontSize: 12, fontWeight: 900, color: '#3a1000', zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 0 #a07040' }}>
          {toast}
        </div>
      )}
    </div>
    </PullToRefresh>
  )
}