'use client'

export default function LoadingScreen() {

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#c8b898',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 999, gap: 24,
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Textura */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(0,0,0,0.06) 0%, transparent 45%)', pointerEvents:'none' }} />

      {/* Animação central */}
      <div style={{ position:'relative', width:120, height:120 }}>

        {/* Anel externo girando */}
        <div style={{
          position:'absolute', inset:0,
          borderRadius:'50%',
          border:'4px solid transparent',
          borderTopColor:'#c8960c',
          borderRightColor:'#FFDF00',
          animation:'spin 1.2s linear infinite',
          boxShadow:'0 0 20px rgba(200,150,0,0.3)',
        }} />

        {/* Anel médio girando ao contrário */}
        <div style={{
          position:'absolute', inset:12,
          borderRadius:'50%',
          border:'3px solid transparent',
          borderTopColor:'#a07040',
          borderLeftColor:'#c8960c',
          animation:'spin-reverse 0.9s linear infinite',
        }} />

        {/* Badge central */}
        <div style={{
          position:'absolute', inset:24,
          borderRadius:'50%',
          background:'linear-gradient(135deg,#1a3060,#3a1060)',
          border:'3px solid #c8960c',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:28,
          boxShadow:'0 4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(200,150,0,0.2)',
          animation:'pulse-badge 1.5s ease infinite alternate',
        }}>
          🇧🇷
        </div>

        {/* Partículas orbitando */}
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position:'absolute',
            top:'50%', left:'50%',
            width:8, height:8,
            borderRadius:'50%',
            background: i % 2 === 0 ? '#FFDF00' : '#c8960c',
            boxShadow:`0 0 6px ${i % 2 === 0 ? '#FFDF00' : '#c8960c'}`,
            transform:`rotate(${i * 90}deg) translateX(56px) translateY(-50%)`,
            animation:`orbit 1.8s linear infinite`,
            animationDelay:`${i * 0.45}s`,
            opacity: 0,
          }} />
        ))}
      </div>

<style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-badge {
          from { transform: scale(0.95); box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 10px rgba(200,150,0,0.1); }
          to   { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 24px rgba(200,150,0,0.35); }
        }
        @keyframes orbit {
          0%   { opacity: 0; transform: rotate(var(--r, 0deg)) translateX(56px) translateY(-50%) scale(0.5); }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(calc(var(--r, 0deg) + 360deg)) translateX(56px) translateY(-50%) scale(0.5); }
        }
      `}</style>
    </div>
  )
}