// ─── Jobs.jsx ──────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllJobs } from '../../services/jobs'
import { PageHeader, Badge, Card, Btn, StatusBadge } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function AdminJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs]     = useState([])
  const [tab, setTab]       = useState('direct')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getAllJobs().then(j => { setJobs(j); setLoading(false) }) }, [])

  const list = jobs.filter(j => j.type === tab)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <div style={{ background:C.surf, padding:'13px 20px 0', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <PageHeader title="Jobs" onBack={() => navigate('/admin')}
          right={<Btn small onClick={() => navigate('/admin/jobs/novo')}>+ Novo Job</Btn>} />
        <div style={{ display:'flex', marginTop:10 }}>
          {[['direct','Diretos'],['open','Abertos']].map(([t,l]) => (
            <button key={t} type="button" onClick={() => setTab(t)} style={{ flex:1, background:'transparent', border:'none', borderBottom:`2px solid ${tab===t?C.limen:'transparent'}`, color:tab===t?C.limen:C.textS, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:13, padding:'9px 0 13px', cursor:'pointer' }}>
              {l} ({jobs.filter(j=>j.type===t).length})
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 20px 40px' }}>
        {loading ? <Spinner /> : list.length === 0
          ? <div style={{ textAlign:'center', padding:'40px 0', color:C.textM }}>Nenhum job.</div>
          : list.map(j => (
            <Card key={j.id} onClick={() => navigate(`/admin/jobs/${j.id}`)} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <Badge label={j.type==='direct'?'Direto':'Aberto'} color={j.type==='direct'?C.violet:C.teal} />
                <StatusBadge status={j.status} />
              </div>
              <div style={{ color:C.text, fontWeight:600, fontSize:13, marginBottom:2 }}>{j.title}</div>
              <div style={{ color:C.iceS, fontSize:12 }}>{j.brand}</div>
              {j.deadline && <div style={{ color:C.textM, fontSize:11, marginTop:5 }}>Prazo: {j.deadline}</div>}
            </Card>
          ))
        }
      </div>
    </div>
  )
}
