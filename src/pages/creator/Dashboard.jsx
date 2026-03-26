import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getMyInvites, getMyBids, getOpenJobs } from '../../services/jobs'
import { Logo, Avatar, Badge, Card, ProgressBar, SLabel, StatusBadge } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function CreatorDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]         = useState('jobs')
  const [invites, setInvites] = useState([])
  const [bids, setBids]       = useState([])
  const [openJobs, setOpenJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const [inv, bd, oj] = await Promise.all([
        getMyInvites(profile.id),
        getMyBids(profile.id),
        getOpenJobs(),
      ])
      setInvites(inv)
      setBids(bd)
      setOpenJobs(oj)
      setLoading(false)
    }
    load()
  }, [profile])

  const pendingInvites = invites.filter(i => i.status === 'pending')
  const pct = profile?.profile_pct || 0

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar name={profile?.full_name || '?'} size={36} />
          <div>
            <div style={{ color:C.text, fontSize:14, fontWeight:600, lineHeight:1.1 }}>{profile?.full_name?.split(' ')[0]}</div>
            <div style={{ color:C.limen, fontSize:10, letterSpacing:'.06em' }}>Creator Parceiro</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {pendingInvites.length > 0 && (
            <div style={{ width:20, height:20, borderRadius:'50%', background:C.rose, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>
              {pendingInvites.length}
            </div>
          )}
          <button type="button" onClick={signOut} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 10px', color:C.textS, fontSize:11, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Sair</button>
        </div>
      </div>

      {/* Profile progress alert */}
      {pct < 80 && (
        <div onClick={() => navigate('/creator/perfil')} style={{ background:`${C.limen}10`, borderBottom:`1px solid ${C.limen}22`, padding:'11px 20px', cursor:'pointer', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ color:C.limen, fontSize:12, fontWeight:600 }}>Complete seu perfil</span>
            <span style={{ color:C.limen, fontSize:12 }}>→</span>
          </div>
          <ProgressBar pct={pct} />
          <div style={{ color:`${C.limen}55`, fontSize:10, marginTop:4 }}>{pct}% concluído</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', background:C.surf, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {[['jobs','Jobs'],['profile','Perfil']].map(([t,l]) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{ flex:1, background:'transparent', border:'none', borderBottom:`2px solid ${tab===t?C.limen:'transparent'}`, color:tab===t?C.limen:C.textS, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:13, padding:'11px 0', cursor:'pointer' }}>{l}</button>
        ))}
      </div>

      <div className="body-scroll">
        {loading ? <Spinner /> : (
          <>
            {tab === 'jobs' && (
              <>
                {/* Pending invites */}
                {pendingInvites.length > 0 && (
                  <div style={{ marginBottom:20 }}>
                    <SLabel>Aguardando resposta</SLabel>
                    {pendingInvites.map(inv => (
                      <Card key={inv.id} onClick={() => navigate(`/creator/job/${inv.id}`)} accent={C.limen} style={{ marginBottom:9 }} className="glow">
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                          <Badge label="Convite Direto" color={C.limen} />
                          <Badge label="Pendente" color={C.warn} dot />
                        </div>
                        <div style={{ color:C.text, fontWeight:700, fontSize:15, marginBottom:3 }}>{inv.job?.title}</div>
                        <div style={{ color:C.iceS, fontSize:12 }}>{inv.job?.brand} · {inv.job?.city}</div>
                        {inv.job?.value && <div style={{ color:C.ok, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, marginTop:8 }}>R$ {Number(inv.job.value).toLocaleString('pt-BR')}</div>}
                        <div style={{ marginTop:10, color:C.limen, fontSize:11, fontWeight:600 }}>Ver e responder →</div>
                      </Card>
                    ))}
                    <div style={{ height:1, background:C.border, margin:'18px 0' }} />
                  </div>
                )}

                {/* All invites */}
                <SLabel>Meus convites diretos</SLabel>
                {invites.length === 0
                  ? <div style={{ color:C.textM, fontSize:13, marginBottom:18 }}>Nenhum convite direto recebido.</div>
                  : invites.map(inv => (
                    <Card key={inv.id} onClick={() => navigate(`/creator/job/${inv.id}`)} style={{ marginBottom:9 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <Badge label="Direto" color={C.violet} />
                        <StatusBadge status={inv.status} />
                      </div>
                      <div style={{ color:C.text, fontWeight:600, fontSize:14 }}>{inv.job?.title}</div>
                      <div style={{ color:C.iceS, fontSize:12, marginTop:3 }}>{inv.job?.brand} · {inv.job?.city}</div>
                    </Card>
                  ))}

                <div style={{ height:1, background:C.border, margin:'18px 0' }} />

                {/* Open jobs */}
                <SLabel>Jobs abertos disponíveis</SLabel>
                {openJobs.length === 0
                  ? <div style={{ color:C.textM, fontSize:13 }}>Nenhum job aberto no momento.</div>
                  : openJobs.map(job => {
                    const meu = bids.find(b => b.job_id === job.id)
                    return (
                      <Card key={job.id} onClick={() => navigate(`/creator/job-aberto/${job.id}`)} style={{ marginBottom:9 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                          <Badge label="Job Aberto" color={C.teal} />
                          {meu
                            ? <Badge label="Proposta enviada" color={C.ok} dot />
                            : <Badge label={`${job.bid_count || 0} proposta${job.bid_count !== 1 ? 's' : ''}`} color={C.textS} />}
                        </div>
                        <div style={{ color:C.text, fontWeight:600, fontSize:14 }}>{job.title}</div>
                        <div style={{ color:C.iceS, fontSize:12, marginTop:3 }}>{job.brand} · {job.city}</div>
                        {job.deadline && <div style={{ color:C.textM, fontSize:11, marginTop:5 }}>Prazo: {job.deadline}</div>}
                      </Card>
                    )
                  })}
              </>
            )}

            {tab === 'profile' && (
              <ProfileTab profile={profile} onEdit={() => navigate('/creator/perfil')} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProfileTab({ profile, onEdit }) {
  const { Btn } = require('../../components/ui/index')
  return (
    <div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:13 }}>
          <Avatar name={profile?.full_name || '?'} size={48} />
          <div style={{ flex:1 }}>
            <div style={{ color:C.text, fontWeight:700, fontSize:16 }}>{profile?.full_name}</div>
            <div style={{ color:C.iceS, fontSize:12, marginTop:2 }}>{profile?.niches?.[0] || 'Nicho não informado'}</div>
            {profile?.term_accepted && <div style={{ marginTop:5 }}><Badge label="Termos aceitos ✓" color={C.ok} /></div>}
          </div>
        </div>
        <ProgressBar pct={profile?.profile_pct || 0} showLabel />
        <button type="button" onClick={onEdit}
          style={{ marginTop:11, width:'100%', padding:'13px', borderRadius:10, border:`1px solid ${C.borderM}`, background:'transparent', color:C.textS, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:14, cursor:'pointer' }}>
          Editar perfil
        </button>
      </Card>
      {[
        { t:'Localização', i:[['Cidade',profile?.city||'—'],['Estado',profile?.state||'—'],['Aceita viajar',profile?.accepts_travel?'Sim':'Não'],['Distância',profile?.max_distance||'—'],['Transporte',profile?.has_transport?profile?.transport_type:'Não possui']] },
        { t:'Redes Sociais', i:[['Instagram',profile?.instagram||'—'],['TikTok',profile?.tiktok||'—'],['YouTube',profile?.youtube||'—'],['Seguidores',profile?.followers_range||'—']] },
        { t:'Disponibilidade', i:[['Recorrente',profile?.recurring?'Sim':'Não'],['Frequência',profile?.frequency||'—'],['Prazo médio',profile?.delivery_deadline||'—']] },
      ].map(s => (
        <div key={s.t} style={{ marginBottom:13 }}>
          <SLabel>{s.t}</SLabel>
          <Card style={{ padding:'11px 13px' }}>
            {s.i.map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ color:C.textS, fontSize:12 }}>{k}</span>
                <span style={{ color:C.text, fontSize:12, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      ))}
      {profile?.niches?.length > 0 && (
        <div style={{ marginBottom:13 }}>
          <SLabel>Nichos</SLabel>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{profile.niches.map(n => <Badge key={n} label={n} color={C.violet} />)}</div>
        </div>
      )}
    </div>
  )
}
