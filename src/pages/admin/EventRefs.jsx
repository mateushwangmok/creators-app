import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEventRefs, upsertEventRef } from '../../services/jobs'
import { PageHeader, Card, Btn, Input, SLabel, Badge, Toast } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function AdminEventRefs() {
  const navigate  = useNavigate()
  const [refs, setRefs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm]     = useState({ name:'', url:'' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  useEffect(() => { getEventRefs().then(r => { setRefs(r); setLoading(false) }) }, [])

  const saveEdit = async () => {
    if (!form.name) { setToast({ msg:'Informe o nome.', type:'error' }); return }
    setSaving(true)
    try {
      const updated = await upsertEventRef({ id: editing, name: form.name, url: form.url })
      setRefs(p => p.map(r => r.id === editing ? updated : r))
      setToast({ msg:'Referência atualizada!' })
      setEditing(null)
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
    setSaving(false)
  }

  const toggleActive = async (ref) => {
    try {
      const updated = await upsertEventRef({ id: ref.id, active: !ref.active })
      setRefs(p => p.map(r => r.id === ref.id ? { ...r, active: !r.active } : r))
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <PageHeader title="Referências de Eventos" sub="Links exibidos na aba EXTRA das creators" onBack={() => navigate('/admin')} />

      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 40px' }}>
        <Card style={{ background:`${C.violet}10`, borderColor:`${C.violet}25`, marginBottom:18, padding:'12px 14px' }}>
          <p style={{ color:C.iceS, fontSize:13, lineHeight:1.55 }}>
            Estas referências aparecem na aba <strong style={{ color:C.limen }}>EXTRA — Eventos e Campanhas</strong> para creators identificadas como feminino. Máximo de 5 referências. Ative/desative individualmente.
          </p>
        </Card>

        {loading ? <Spinner /> : refs.map(r => (
          <div key={r.id} style={{ marginBottom:10 }}>
            {editing === r.id ? (
              <Card style={{ borderColor:C.limen }}>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <Input label="Nome da referência" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Ex: Som Automotivo — Step Sound" />
                  <Input label="Link externo" value={form.url} onChange={v=>setForm(p=>({...p,url:v}))} placeholder="https://..." />
                  <div style={{ display:'flex', gap:8 }}>
                    <Btn variant="outline" onClick={() => setEditing(null)} style={{ flex:1 }}>Cancelar</Btn>
                    <Btn onClick={saveEdit} disabled={saving} style={{ flex:2 }}>{saving?'Salvando...':'Salvar'}</Btn>
                  </div>
                </div>
              </Card>
            ) : (
              <Card style={{ opacity:r.active ? 1 : .55 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ color:r.active?C.text:C.textS, fontSize:13, fontWeight:600 }}>{r.name}</div>
                    <div style={{ color:C.textM, fontSize:11, marginTop:2 }}>{r.url || 'Nenhum link configurado'}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button type="button" onClick={() => { setEditing(r.id); setForm({ name:r.name, url:r.url||'' }) }}
                      style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:7, padding:'5px 9px', color:C.textS, fontSize:11, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                      Editar
                    </button>
                    <button type="button" onClick={() => toggleActive(r)}
                      style={{ background:r.active?`${C.ok}20`:`${C.rose}15`, border:`1px solid ${r.active?C.ok:C.rose}30`, borderRadius:7, padding:'5px 9px', color:r.active?C.ok:C.rose, fontSize:11, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                      {r.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ))}

        <div style={{ background:C.surf, border:`1px dashed ${C.borderM}`, borderRadius:10, padding:'11px 14px', textAlign:'center', marginTop:8 }}>
          <div style={{ color:C.textM, fontSize:12 }}>Máximo de 5 referências. {refs.filter(r=>r.active).length} ativas no momento.</div>
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
