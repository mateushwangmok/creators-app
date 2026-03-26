import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo } from '../components/ui/index'
import { Btn, Badge, Card } from '../components/ui/index'
import { C } from '../styles/tokens'
import { useEffect } from 'react'

export default function Landing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/creator', { replace: true })
    }
  }, [user, profile, navigate])

  return (
    <div className="screen">
      <div className="body-scroll">
        <div style={{ paddingTop:52, paddingBottom:40, borderBottom:`1px solid ${C.border}`, marginBottom:30 }} className="fu">
          <Logo />
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:26, color:C.text, lineHeight:1.2, marginTop:24 }}>
            Uma rede exclusiva e privada para creators parceiros.
          </div>
          <p style={{ color:C.iceS, fontSize:14, marginTop:12, lineHeight:1.7 }}>
            Acesso por convite. Oportunidades alinhadas ao seu perfil. Apenas creators selecionados fazem parte.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:32 }} className="fu2">
          {[
            { tag:'Acesso restrito',  title:'Rede selecionada',       desc:'Participação exclusiva por convite direto de Mateus Hwangmok. Não é uma plataforma aberta.' },
            { tag:'Jobs sob medida',  title:'Oportunidades alinhadas', desc:'Cada job é enviado com base no seu nicho, cidade, disponibilidade e estilo de entrega.' },
            { tag:'Privacidade total',title:'Propostas confidenciais', desc:'Suas propostas são privadas. Ninguém além de Mateus Hwangmok poderá ver os seus valores.' },
          ].map(f => (
            <Card key={f.tag} style={{ padding:'14px 16px' }}>
              <div style={{ marginBottom:6 }}><Badge label={f.tag} color={C.limen} xs /></div>
              <div style={{ color:C.text, fontWeight:600, fontSize:14, marginBottom:4 }}>{f.title}</div>
              <div style={{ color:C.iceS, fontSize:13, lineHeight:1.55 }}>{f.desc}</div>
            </Card>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:9 }} className="fu3">
          <Btn full onClick={() => navigate('/cadastro')}>Criar minha conta</Btn>
          <Btn full variant="outline" onClick={() => navigate('/login')}>Já tenho acesso — Entrar</Btn>
          <button
            onClick={() => navigate('/acesso-cliente')}
            style={{ background:'transparent', border:'none', color:C.textM, fontSize:11, cursor:'pointer', textAlign:'center', padding:'6px 0', fontFamily:"'Outfit',sans-serif" }}
          >
            Acesso de cliente
          </button>
        </div>

        <p style={{ color:C.textM, fontSize:11, textAlign:'center', marginTop:22, lineHeight:1.7 }}>
          Sistema privado.<br/>Acesso exclusivo por link de convite.
        </p>
      </div>
    </div>
  )
}
