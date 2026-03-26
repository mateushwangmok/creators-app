import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJobById, getInvitesForJob, getBidsForJob } from '../../services/jobs'
import { PageHeader, Avatar, Badge, Card, SLabel, StatusBadge } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function AdminJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob]         = useState(null)
  const [invites, setInvites] = useState([])
  const [bids, setBids]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const j = await getJobById(id)
      setJob(j)
      if (j.type === 'direct') {
        const inv = await getInvitesForJob(id)
        setInvites(inv)
      } else {
        const b = await getBidsForJob(id)
        setBids(b)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="screen"><Spinner /></div>
  if (!job) return <div className="screen"><div className="body-scroll"><p style={{ color:C.textS }}>Job não encontrado.</p></div></div>

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <PageHeader title={job.title} onBack={() => navigate('/admin/jobs')} />
        <div style={{ display:'flex', gap:7, marginTop:8 }}>
          <Badge label={job.type==='direct'?'Direto':'Aberto'} color={job.type==='direct'?C.violet:C.teal} />
          <StatusBadge status={job.status} />
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 40px' }}>
        <div style={{ color:C.iceS, fontSize:13, marginBottom:16 }}>{job.brand} · {job.city}</div>

        {job.value && (
          <Card style={{ marginBottom:13, background:`${C.ok}10`, borderColor:`${C.ok}25` }}>
            <div style={{ color:C.iceS, fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:3 }}>Valor</div>
            <div style={{ color:C.ok, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:27 }}>
              R$ {Number(job.value).toLocaleString('pt-BR')}
            </div>
          </Card>
        )}

        <div style={{ marginBottom:13 }}><SLabel>Descrição</SLabel><div style={{ color:C.text, fontSize:13, lineHeight:1.6 }}>{job.description}</div></div>

        {job.deliverables?.length > 0 && (
          <div style={{ marginBottom:15 }}>
            <SLabel>Entregas</SLabel>
            {job.deliverables.map((d,i) => (
              <div key={i} style={{ display:'flex', gap:7, padding:'4px 0' }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:C.limen, marginTop:6, flexShrink:0 }} />
                <span style={{ color:C.text, fontSize:13 }}>{d}</span>
              </div>
            ))}
          </div>
        )}

        {/* Direct invites */}
        {job.type === 'direct' && (
          <div style={{ marginBottom:15 }}>
            <SLabel>Creators Convidadas ({invites.length})</SLabel>
            {invites.length === 0
              ? <div style={{ color:C.textM, fontSize:13 }}>Nenhuma convidada ainda.</div>
              : invites.map(inv => (
                <Card key={inv.id} style={{ marginBottom:7, padding:'10px 13px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <Avatar name={inv.creator?.full_name||'?'} size={33} />
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{inv.creator?.full_name||'—'}</div>
                      <div style={{ color:C.iceS, fontSize:11 }}>{inv.creator?.niches?.[0]||'—'} · {inv.creator?.followers_range||'—'}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </Card>
              ))
            }
          </div>
        )}

        {/* Open bids */}
        {job.type === 'open' && (
          <div>
            <Card style={{ background:`${C.limen}08`, borderColor:`${C.limen}20`, marginBottom:13, padding:'13px 15px' }}>
              <div style={{ color:C.iceS, fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:3 }}>Total de propostas</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, color:C.limen, lineHeight:1 }}>{bids.length}</div>
              <div style={{ color:C.textM, fontSize:11, marginTop:5 }}>Creators veem apenas este número.</div>
            </Card>
            <SLabel>Propostas — visível apenas para você</SLabel>
            {bids.length === 0
              ? <div style={{ color:C.textM, fontSize:13, textAlign:'center', padding:'16px 0' }}>Nenhuma proposta ainda.</div>
              : bids.map((bid, i) => (
                <Card key={bid.id} style={{ marginBottom:8, ...(i===0?{borderLeft:`3px solid ${C.limen}`}:{}) }}>
                  {i === 0 && <div style={{ color:C.limen, fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>Maior proposta</div>}
                  <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:bid.note?8:0 }}>
                    <Avatar name={bid.creator?.full_name||'?'} size={32} />
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontSize:12, fontWeight:600 }}>{bid.creator?.full_name||'—'}</div>
                      <div style={{ color:C.iceS, fontSize:11 }}>{bid.creator?.niches?.[0]||'—'} · {bid.creator?.followers_range||'—'}</div>
                    </div>
                    <div style={{ color:C.ok, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>
                      R$ {Number(bid.amount).toLocaleString('pt-BR', { minimumFractionDigits:2 })}
                    </div>
                  </div>
                  {bid.note && <div style={{ color:C.iceS, fontSize:11, borderTop:`1px solid ${C.border}`, paddingTop:7, lineHeight:1.5 }}>"{bid.note}"</div>}
                  <div style={{ color:C.textM, fontSize:10, marginTop:5 }}>{bid.created_at?.split('T')[0]}</div>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}
