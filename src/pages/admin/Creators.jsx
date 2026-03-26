import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCreators } from '../../services/profiles'
import { PageHeader, Avatar, Badge, Card, ProgressBar, StatusBadge, SLabel } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C, NICHES, STATES } from '../../styles/tokens'

export default function AdminCreators() {
  const navigate = useNavigate()
  const [creators, setCreators] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filters, setFilters]   = useState({ gender:'', state:'', travel:'', transport:'', complete:'' })
  const uF = (k,v) => setFilters(p => ({ ...p, [k]:v }))

  useEffect(() => {
    getAllCreators().then(c => { setCreators(c); setLoading(false) })
  }, [])

  const list = creators.filter(c => {
    const s = search.toLowerCase()
    const ms = !s || c.full_name?.toLowerCase().includes(s) || (c.city||'').toLowerCase().includes(s) || (c.niches?.join('')||'').toLowerCase().includes(s)
    const mg = !filters.gender   || c.gender === filters.gender
    const mst= !filters.state    || c.state  === filters.state
    const mt = !filters.travel   || c.accepts_travel === (filters.travel==='sim')
    const mtr= !filters.transport|| c.has_transport  === (filters.transport==='sim')
    const mc = !filters.complete || (filters.complete==='sim' ? c.profile_pct>=80 : c.profile_pct<80)
    return ms && mg && mst && mt && mtr && mc
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <div style={{ background:C.surf, padding:'13px 20px 11px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <PageHeader title="Creators" onBack={() => navigate('/admin')}
          right={<Badge label={`${list.length} / ${creators.length}`} color={C.limen} />} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nome, cidade, nicho..."
          style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px', color:C.text, fontFamily:"'Outfit',sans-serif", fontSize:12, outline:'none', marginTop:10 }}/>
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginTop:9, paddingBottom:3 }}>
          {[
            {k:'gender',   opts:['','feminino','masculino','outro','prefiro não informar'], ph:'Gênero'},
            {k:'state',    opts:[''].concat(STATES), ph:'Estado'},
            {k:'travel',   opts:['','sim','não'], ph:'Viaja'},
            {k:'transport',opts:['','sim','não'], ph:'Transporte'},
            {k:'complete', opts:['','sim','não'], ph:'Perfil'},
          ].map(fi => (
            <select key={fi.k} value={filters[fi.k]} onChange={e=>uF(fi.k,e.target.value)}
              style={{ background:filters[fi.k]?C.limenFade:C.surf, border:`1px solid ${filters[fi.k]?C.limen:C.borderM}`, borderRadius:20, padding:'5px 11px', color:filters[fi.k]?C.limen:C.textS, fontSize:11, fontFamily:"'Outfit',sans-serif", cursor:'pointer', flexShrink:0 }}>
              <option value="">{fi.ph}</option>
              {fi.opts.filter(o=>o!=='').map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'11px 20px 40px' }}>
        {loading ? <Spinner /> : list.length === 0
          ? <div style={{ textAlign:'center', padding:'40px 0', color:C.textM }}>Nenhuma creator encontrada.</div>
          : list.map(c => (
            <Card key={c.id} onClick={() => navigate(`/admin/creators/${c.id}`)} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <Avatar name={c.full_name||'?'} size={40} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ color:C.text, fontWeight:600, fontSize:13 }}>{c.full_name}</div>
                    <StatusBadge status={c.status||'active'} />
                  </div>
                  <div style={{ color:C.iceS, fontSize:11, marginTop:1 }}>{c.niches?.[0]||'—'} · {c.city||'—'}, {c.state||'—'}</div>
                  <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap' }}>
                    {c.gender && <Badge label={c.gender} color={C.violet} xs />}
                    {c.followers_range && <Badge label={c.followers_range} color={C.textS} xs />}
                  </div>
                  <div style={{ marginTop:7 }}>
                    <ProgressBar pct={c.profile_pct||0} />
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                      <span style={{ color:C.textM, fontSize:10 }}>{c.profile_pct||0}%</span>
                      {c.term_accepted && <Badge label="Termos ✓" color={C.ok} xs />}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
