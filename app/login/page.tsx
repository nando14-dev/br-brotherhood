'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register' | 'verify' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleLogin() {
    if (!email || !password) { showToast('⚠️ Preencha todos os campos'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { showToast('⚠️ ' + error.message); return }
    router.push('/')
  }

  async function handleRegister() {
    if (!email || !email.includes('@')) { showToast('⚠️ Email inválido'); return }
    if (password.length < 6) { showToast('⚠️ Senha com mínimo 6 caracteres'); return }
    if (password !== password2) { showToast('⚠️ As senhas não coincidem'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) { showToast('⚠️ ' + error.message); return }
    setMode('verify')
  }

  async function handleForgot() {
    if (!email || !email.includes('@')) { showToast('⚠️ Email inválido'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback` })
    setLoading(false)
    showToast('📧 Link enviado!')
    setTimeout(() => setMode('login'), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.7)',
    border: '2px solid #c0a060',
    borderRadius: 10, padding: '12px 14px',
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14, fontWeight: 700,
    color: '#1a0800', outline: 'none',
  }

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, #FFDF00, #c8960c)',
    border: 'none', borderRadius: 12, padding: 14,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14, fontWeight: 900,
    letterSpacing: '1px', textTransform: 'uppercase' as const,
    color: '#3a1000', cursor: 'pointer',
    boxShadow: '0 4px 0 #805800',
    marginTop: 4,
  }

  const btnSecondary: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, #e8d8b8, #d8c8a0)',
    border: '2px solid #c0a060',
    borderRadius: 12, padding: 13,
    fontFamily: "'Nunito', sans-serif",
    fontSize: 13, fontWeight: 900,
    color: '#5a3a10', cursor: 'pointer',
    boxShadow: '0 3px 0 #a07040',
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#c8b898',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'Nunito', sans-serif",
      position: 'relative',
    }}>

      {/* Fundo textura */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(0,0,0,0.06) 0%, transparent 45%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:380, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:1 }}>

        {/* LOGO */}
        <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#5a2a08,#3a1000)', border:'3px solid #c8960c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, marginBottom:12, boxShadow:'0 6px 0 #805800, 0 8px 20px rgba(0,0,0,0.3)' }}>
          🇧🇷
        </div>
        <div style={{ fontFamily:"'Nunito', sans-serif", fontSize:24, fontWeight:900, color:'#1a0800', letterSpacing:2, marginBottom:4, textAlign:'center' }}>BR BROTHERHOOD</div>
        <div style={{ fontSize:11, fontWeight:700, color:'#8a6030', letterSpacing:2, textTransform:'uppercase', marginBottom:32 }}>#P9P2RRG · desde 2016</div>

        {/* LOGIN */}
        {mode === 'login' && (
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>E-mail</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>Senha</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div style={{ textAlign:'right' }}><span onClick={() => setMode('forgot')} style={{ fontSize:11, fontWeight:700, color:'#c8960c', cursor:'pointer' }}>Esqueci a senha</span></div>
            <button style={btnPrimary} onClick={handleLogin} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
              <span style={{ fontSize:11, fontWeight:700, color:'#8a6030' }}>Novo por aqui?</span>
              <div style={{ flex:1, height:2, background:'linear-gradient(270deg,#c8960c,transparent)', borderRadius:1 }} />
            </div>
            <button style={btnSecondary} onClick={() => setMode('register')}>Criar conta</button>
          </div>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#1a0800' }}>Criar conta</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#8a6030' }}>Junte-se ao BR Brotherhood</div>
            </div>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>E-mail</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>Senha</label><input style={inputStyle} type="password" placeholder="mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>Confirmar senha</label><input style={inputStyle} type="password" placeholder="repita a senha" value={password2} onChange={e => setPassword2(e.target.value)} /></div>
            <button style={btnPrimary} onClick={handleRegister} disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
            <button style={btnSecondary} onClick={() => setMode('login')}>Já tenho conta</button>
          </div>
        )}

        {/* VERIFY */}
        {mode === 'verify' && (
          <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:64, marginBottom:8 }}>📬</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#1a0800', textAlign:'center' }}>Verifique seu email</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#8a6030', textAlign:'center', lineHeight:1.7 }}>
              Enviamos um link para<br/>
              <span style={{ color:'#c8960c', fontWeight:900 }}>{email}</span>
            </div>
            <div style={{ background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8a870', borderRadius:14, padding:'14px 16px', textAlign:'center', boxShadow:'0 3px 0 #a07040', width:'100%' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#5a4020', lineHeight:1.7 }}>Clique no link do email para ativar sua conta. Depois volte aqui e faça login normalmente.</div>
            </div>
            <button style={btnSecondary} onClick={() => setMode('login')}>Voltar ao login</button>
          </div>
        )}

        {/* FORGOT */}
        {mode === 'forgot' && (
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'#1a0800' }}>Recuperar acesso</div>
              <div style={{ fontSize:11, fontWeight:700, color:'#8a6030' }}>Enviaremos um link para seu email</div>
            </div>
            <div><label style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:6, display:'block' }}>E-mail cadastrado</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button style={btnPrimary} onClick={handleForgot} disabled={loading}>{loading ? 'Enviando...' : 'Enviar link'}</button>
            <button style={btnSecondary} onClick={() => setMode('login')}>Voltar ao login</button>
          </div>
        )}

      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8960c', borderRadius:20, padding:'10px 20px', fontSize:12, fontWeight:900, color:'#3a1000', zIndex:999, whiteSpace:'nowrap', boxShadow:'0 4px 0 #a07040' }}>
          {toast}
        </div>
      )}
    </div>
  )
}