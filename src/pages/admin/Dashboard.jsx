import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getAllCreators } from '../../services/profiles'
import { getAllJobs } from '../../services/jobs'
import { Logo, Card, SLabel } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [creators, setCreators] = useState([])
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getAllCreators(), getAllJobs()]).then(([c, j]) => {
      setCreators(c); setJobs(j); setLoading(false)
    })
  }, [])

  const stats = [
    [creators.length,                                                          'Creators',          C.limen],
    [creators.filter(c=>c.profile_pct>=80).length,                            'Perfis completos',  C.ok],
    [creators.filter(c=>c.status==='pending').length,                          'Pendentes',         C.warn],
    [jobs.filter(j=>j.status==='open').length,                                 'Jobs ativos',       C.violet],
    [jobs.filter(j=>j.type==='direct').length,                                 'Convites diretos',  C.teal],
    [jobs.filter(j=>j.type==='open').length,                                   'Jobs abertos',      C.rose],
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      {/* Header */}
      <div style={{ background:C.surf, padding:'15px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <Logo />
            <div style={{ color:C.rose, fontSize:10, letterSpacing:'.14em', marginTop:5, textTransform:'uppercase' }}>Painel Master</div>
          </div>
          <button type="button" onClick={signOut} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 10px', color:C.textS, fontSize:11, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Sair</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'18px 20px 80px' }}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:20 }}>
              {stats.map(([v,l,c]) => (
                <Card key={l} style={{ padding:'13px 14px' }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:c, lineHeight:1 }}>{v}</div>
                  <div style={{ color:C.textM, fontSize:11, marginTop:4, lineHeight:1.3 }}>{l}</div>
                </Card>
              ))}
            </div>

            <SLabel>Acesso rápido</SLabel>
            {[
              ['Creators da Rede',     `${creators.length} cadastradas`,           '/admin/creators',    C.limen],
              ['Gestão de Jobs',       `${jobs.filter(j=>j.status==='open').length} ativos`, '/admin/jobs', C.teal],
              ['Referências de Eventos','Gerenciar links de campanha',              '/admin/referencias', C.violet],
            ].map(([t,s,path,c]) => (
              <Card key={path} onClick={() => navigate(path)} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${c}18`, border:`1px solid ${c}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ width:13, height:13, borderRadius:3, background:c }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{t}</div>
                  <div style={{ color:C.iceS, fontSize:12, marginTop:1 }}>{s}</div>
                </div>
                <div style={{ color:c, fontSize:16 }}>→</div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
