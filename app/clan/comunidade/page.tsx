'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import LoadingScreen from '@/components/LoadingScreen'

type Tab = 'recrutar' | 'forum' | 'news'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
  profiles: { display_name: string; avatar_emoji: string }
}

interface News {
  id: string
  tag: string
  title: string
  body: string
  created_at: string
  user_id: string
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
  const [clanRole, setClanRole] = useState('member')
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  const isAdmin = clanRole === 'leader' || clanRole === 'coLeader'

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('clan_role')
        .eq('id', user.id)
        .single()
      if (profile?.clan_role) setClanRole(profile.clan_role)
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (tab === 'forum') loadPosts()
    if (tab === 'news') loadNews()
  }, [tab])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(display_name, avatar_emoji)')
      .order('created_at', { ascending: false })
    if (data) setPosts(data as any)
    setLoading(false)
  }

  async function loadNews() {
    setLoading(true)
    const { data } = await supabase
      .from('clan_news')
      .select('*, profiles(display_name)')
      .order('created_at', { ascending: false })
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
    await supabase.from('clan_news').delete().eq('id', id)
    showToast('🗑️ News removida')
    loadNews()
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (d > 0) return `${d}d atrás`
    if (h > 0) return `${h}h atrás`
    return 'agora'
  }

  const tabStyle = (t: Tab) => ({
    flex: 1, padding: '9px 6px', textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
    fontSize: 10, fontWeight: 700 as const, cursor: 'pointer' as const,
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
    background: tab === t ? '#C8973A' : 'rgba(255,255,255,0.04)',
    color: tab === t ? '#080A0F' : 'rgba(240,234,214,0.4)',
    transition: 'all 0.15s'
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
    padding: '10px 12px', color: '#F0EAD6',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', marginBottom: 8
  }

  return (
    <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6' }}>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <button style={tabStyle('recrutar')} onClick={() => setTab('recrutar')}>📣 Recrutar</button>
        <button style={tabStyle('forum')} onClick={() => setTab('forum')}>💬 Fórum</button>
        <button style={tabStyle('news')} onClick={() => setTab('news')}>📰 News</button>
      </div>

      {/* ── RECRUTAR ── */}
      {tab === 'recrutar' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,95,70,0.04))', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>🇧🇷 Junte-se ao clã</div>
            <div style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)', lineHeight: 1.6, marginBottom: 14 }}>Um dos clãs mais tradicionais do Brasil. Respeito, amizade e conquistas desde janeiro de 2016.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[{v:'9',l:'Anos'},{v:'39',l:'Membros'},{v:'827',l:'★ War'}].map(s => (
                <div key={s.l} style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 6px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.12)' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: '#6ee7b7' }}>{s.v}</div>
                  <div style={{ fontSize: 8, color: 'rgba(240,234,214,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => {
              const text = '🇧🇷 *BR Brotherhood* — clã top do Brasil!\n\n⚔️ TH13+\n🏆 Ranking mensal · Season Pass de prêmio\n🔥 App exclusivo do clã\n\n👉 Tag: #P9P2RRG'
              if (navigator.share) navigator.share({ text })
              else { navigator.clipboard?.writeText(text); showToast('📋 Texto copiado!') }
            }} style={{ width: '100%', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 12, padding: 13, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>📤</span> Compartilhar no WhatsApp
            </button>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            Requisitos <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px' }}>
            {[['🏠','Town Hall 13 ou superior'],['⚔️','Participar das guerras'],['🇧🇷','Falar português'],['❤️','Respeito acima de tudo']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ color: '#2ECC71', fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FORUM ── */}
      {tab === 'forum' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <button onClick={() => setShowNewPost(!showNewPost)} style={{ background: 'transparent', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#E8B84B', cursor: 'pointer' }}>
              {showNewPost ? '✕ Cancelar' : '+ Novo tópico'}
            </button>
          </div>

          {showNewPost && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <input placeholder="Título do tópico" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} />
              <textarea placeholder="Conteúdo..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              <button onClick={savePost} disabled={saving} style={{ width: '100%', background: 'linear-gradient(135deg,#C8973A,#E8B84B)', border: 'none', borderRadius: 10, padding: 11, fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#080A0F', cursor: 'pointer' }}>
                {saving ? 'Publicando...' : 'PUBLICAR'}
              </button>
            </div>
          )}

          {loading ? <LoadingScreen /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {posts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(240,234,214,0.4)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Nenhum tópico ainda</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Seja o primeiro a postar!</div>
                </div>
              )}
              {posts.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {p.profiles?.avatar_emoji || '⚔️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{p.profiles?.display_name || 'Membro'}</div>
                      <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)' }}>{timeAgo(p.created_at)}</div>
                    </div>
                    {(isAdmin || p.user_id === userId) && (
                      <button onClick={() => deletePost(p.id)} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#E74C3C', cursor: 'pointer' }}>🗑️</button>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5, lineHeight: 1.4 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,234,214,0.5)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NEWS ── */}
      {tab === 'news' && (
        <div>
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <button onClick={() => setShowNewNews(!showNewNews)} style={{ background: 'transparent', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#E8B84B', cursor: 'pointer' }}>
                {showNewNews ? '✕ Cancelar' : '+ Nova news'}
              </button>
            </div>
          )}

          {showNewNews && isAdmin && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <select value={newNewsTag} onChange={e => setNewNewsTag(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>📢 Aviso do Líder</option>
                <option>🏆 Resultado</option>
                <option>🎉 Novo membro</option>
                <option>⚔️ Guerra</option>
                <option>📣 Recrutamento</option>
              </select>
              <input placeholder="Título da news" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} style={inputStyle} />
              <textarea placeholder="Conteúdo..." value={newNewsBody} onChange={e => setNewNewsBody(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              <button onClick={saveNews} disabled={saving} style={{ width: '100%', background: 'linear-gradient(135deg,#C8973A,#E8B84B)', border: 'none', borderRadius: 10, padding: 11, fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#080A0F', cursor: 'pointer' }}>
                {saving ? 'Publicando...' : 'PUBLICAR'}
              </button>
            </div>
          )}

          {loading ? <LoadingScreen /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {news.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(240,234,214,0.4)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Nenhuma news ainda</div>
                  {isAdmin && <div style={{ fontSize: 11, marginTop: 4 }}>Publique a primeira news do clã!</div>}
                </div>
              )}
              {news.map(n => (
                <div key={n.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, position: 'relative' }}>
                  {isAdmin && (
                    <button onClick={() => deleteNews(n.id)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#E74C3C', cursor: 'pointer' }}>🗑️</button>
                  )}
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#E8B84B', marginBottom: 6 }}>{n.tag}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.3, paddingRight: isAdmin ? 40 : 0 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)', lineHeight: 1.6 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.3)', fontWeight: 500, marginTop: 8 }}>
                    {n.profiles?.display_name} · {timeAgo(n.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#0f1520', border: '1px solid rgba(200,151,58,0.3)', borderRadius: 20, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}