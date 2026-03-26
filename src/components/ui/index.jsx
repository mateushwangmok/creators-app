import { useState, useEffect } from 'react'
import { C } from '../../styles/tokens'

// ─── Logo ──────────────────────────────────────────────
export function Logo({ compact }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', lineHeight:1, gap:3 }}>
      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:compact?19:26, color:C.text, letterSpacing:'-.02em' }}>
        Creators
      </span>
      <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:400, fontSize:compact?9:11, color:C.limen, letterSpacing:'.14em', textTransform:'uppercase' }}>
        from Mateus Hwangmok
      </span>
    </div>
  )
}

// ─── Spinner ───────────────────────────────────────────
export default function Spinner({ size = 28, color = C.limen }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', border:`3px solid ${color}22`, borderTop:`3px solid ${color}`, animation:'spin .8s linear infinite', margin:'40px auto' }}/>
  )
}

// ─── Btn ───────────────────────────────────────────────
export function Btn({ children, onClick, variant='primary', small, disabled, full, style:sx={}, type='button' }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
    border:'none', borderRadius:10, cursor:disabled?'not-allowed':'pointer',
    fontFamily:"'Outfit',sans-serif", fontWeight:600, transition:'all .15s',
    opacity:disabled?.4:1, width:full?'100%':undefined,
    padding:small?'8px 15px':'13px 20px', fontSize:small?12:14,
  }
  const vars = {
    primary: { background:C.limen, color:'#001621' },
    outline: { background:'transparent', border:`1px solid ${C.borderM}`, color:C.textS },
    ghost:   { background:'transparent', color:C.limen },
    danger:  { background:'transparent', border:`1px solid ${C.rose}`, color:C.rose },
    teal:    { background:C.teal, color:'#001621' },
    surf:    { background:C.surf, border:`1px solid ${C.border}`, color:C.ice },
  }
  return (
    <button type={type} onClick={disabled?undefined:onClick} style={{...base,...vars[variant],...sx}}>
      {children}
    </button>
  )
}

// ─── Badge ─────────────────────────────────────────────
export function Badge({ label, color=C.limen, dot, xs }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:xs?'2px 7px':'3px 10px', borderRadius:20, fontSize:xs?10:11, fontWeight:600, fontFamily:"'Outfit',sans-serif", background:`${color}18`, color, border:`1px solid ${color}28` }}>
      {dot && <span style={{ width:4, height:4, borderRadius:'50%', background:color, animation:'dotPulse 2s ease infinite' }}/>}
      {label}
    </span>
  )
}

// ─── Avatar ────────────────────────────────────────────
export function Avatar({ name='?', size=40 }) {
  const pal = [C.limen, C.teal, C.violet, C.rose, C.warn]
  const col = pal[((name.charCodeAt(0)||0)+(name.charCodeAt(1)||0))%pal.length]
  const ini = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div style={{ width:size, height:size, borderRadius:size/3.5, background:`${col}15`, border:`1.5px solid ${col}35`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:size*.36, color:col, flexShrink:0 }}>
      {ini}
    </div>
  )
}

// ─── Input ─────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type='text', disabled, hint, required }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && (
        <label style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em' }}>
          {label}{required && <span style={{ color:C.rose }}> *</span>}
        </label>
      )}
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 13px', color:C.text, fontFamily:"'Outfit',sans-serif", fontSize:13, outline:'none', width:'100%', opacity:disabled?.5:1 }}
        onFocus={e=>e.target.style.borderColor=C.limen+'55'}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
      {hint && <span style={{ color:C.textM, fontSize:11 }}>{hint}</span>}
    </div>
  )
}

// ─── SelectField ───────────────────────────────────────
export function SelectField({ label, value, onChange, options, placeholder='Selecione...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 13px', color:value?C.text:C.textM, fontFamily:"'Outfit',sans-serif", fontSize:13, outline:'none', width:'100%' }}>
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  )
}

// ─── Textarea ──────────────────────────────────────────
export function Textarea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>}
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:'11px 13px', color:C.text, fontFamily:"'Outfit',sans-serif", fontSize:13, outline:'none', width:'100%', resize:'none' }}
        onFocus={e=>e.target.style.borderColor=C.limen+'55'}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  )
}

// ─── Chips ─────────────────────────────────────────────
export function Chips({ label, options, selected, onChange, columns=2 }) {
  const tog = v => onChange(selected.includes(v)?selected.filter(x=>x!==v):[...selected,v])
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {label && <label style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${columns},1fr)`, gap:6 }}>
        {options.map(o=>{
          const on=selected.includes(o)
          return (
            <button key={o} type="button" onClick={()=>tog(o)} style={{ padding:'8px 10px', borderRadius:8, fontSize:12, fontFamily:"'Outfit',sans-serif", cursor:'pointer', border:`1px solid ${on?C.limen:C.borderM}`, background:on?C.limenFade:'transparent', color:on?C.limen:C.textS, textAlign:'left', transition:'all .15s' }}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Toggle ────────────────────────────────────────────
export function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
      <span style={{ color:C.text, fontSize:13 }}>{label}</span>
      <div onClick={()=>onChange(!value)} style={{ width:42, height:23, borderRadius:12, cursor:'pointer', position:'relative', background:value?C.limen:C.borderM, transition:'background .2s', flexShrink:0 }}>
        <div style={{ position:'absolute', top:2.5, left:value?21:2.5, width:18, height:18, borderRadius:'50%', background:value?'#001621':C.textM, transition:'left .2s' }}/>
      </div>
    </div>
  )
}

// ─── RadioGroup ────────────────────────────────────────
export function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {label && <label style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {options.map(o=>(
          <div key={o} onClick={()=>onChange(o)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'10px 12px', borderRadius:9, border:`1px solid ${value===o?C.limen:C.border}`, background:value===o?C.limenFade:'transparent', transition:'all .15s' }}>
            <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${value===o?C.limen:C.borderM}`, background:value===o?C.limen:'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {value===o && <div style={{ width:6, height:6, borderRadius:'50%', background:'#001621' }}/>}
            </div>
            <span style={{ color:value===o?C.text:C.textS, fontSize:13 }}>{o}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Card ──────────────────────────────────────────────
export function Card({ children, onClick, style:sx={}, accent }) {
  const [h,setH]=useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}
      style={{ background:h&&onClick?C.cardH:C.card, border:`1px solid ${h&&onClick?C.borderM:C.border}`, borderRadius:14, padding:'15px', cursor:onClick?'pointer':'default', transition:'all .18s', ...(accent?{borderLeft:`3px solid ${accent}`}:{}),...sx }}>
      {children}
    </div>
  )
}

// ─── ProgressBar ───────────────────────────────────────
export function ProgressBar({ pct, height=5, showLabel, color }) {
  const col = color||(pct>=80?C.ok:pct>=50?C.limen:C.rose)
  return (
    <div>
      {showLabel && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ color:C.textS, fontSize:10 }}>Perfil completo</span>
          <span style={{ color:col, fontSize:10, fontWeight:700 }}>{pct}%</span>
        </div>
      )}
      <div style={{ width:'100%', height, borderRadius:height/2, background:C.border }}>
        <div style={{ width:`${pct}%`, height, borderRadius:height/2, background:col, transition:'width .6s' }}/>
      </div>
    </div>
  )
}

// ─── StatusBadge ───────────────────────────────────────
export function StatusBadge({ status }) {
  const m = {
    pending:       { l:'Pendente',         c:C.warn },
    accepted:      { l:'Aceito',           c:C.ok },
    refused:       { l:'Recusado',         c:C.rose },
    proposal_sent: { l:'Proposta Enviada', c:C.violet },
    active:        { l:'Ativa',            c:C.ok },
    closed:        { l:'Encerrado',        c:C.textM },
    finalized:     { l:'Finalizado',       c:C.teal },
  }
  const s = m[status] || { l:status, c:C.textS }
  return <Badge label={s.l} color={s.c} dot/>
}

// ─── Toast ─────────────────────────────────────────────
export function Toast({ msg, type='success', onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return()=>clearTimeout(t) },[onClose])
  return (
    <div style={{ position:'fixed', bottom:88, left:'50%', transform:'translateX(-50%)', background:type==='error'?C.rose:C.ok, color:'#001621', fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:700, padding:'10px 18px', borderRadius:10, zIndex:999, whiteSpace:'nowrap', animation:'fadeUp .3s ease', boxShadow:'0 6px 24px #00000055' }}>
      {msg}
    </div>
  )
}

// ─── BackBtn ───────────────────────────────────────────
export function BackBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ background:'transparent', border:'none', color:C.limen, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:5 }}>
      ← Voltar
    </button>
  )
}

// ─── SLabel ────────────────────────────────────────────
export function SLabel({ children }) {
  return (
    <div style={{ color:C.iceS, fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:9 }}>
      {children}
    </div>
  )
}

// ─── Divider ───────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
      <div style={{ flex:1, height:1, background:C.border }}/>
      {label && <span style={{ color:C.textM, fontSize:11 }}>{label}</span>}
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  )
}

// ─── PageHeader ────────────────────────────────────────
export function PageHeader({ title, sub, onBack, right }) {
  return (
    <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
      {onBack && <div style={{ marginBottom:9 }}><BackBtn onClick={onBack}/></div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:21, color:C.text }}>{title}</div>
          {sub && <div style={{ color:C.textS, fontSize:12, marginTop:2 }}>{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────
export function Modal({ children, onClose, title }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'#00000099', zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div style={{ background:C.surf, borderRadius:'18px 18px 0 0', padding:'20px 20px 36px', width:'100%', maxWidth:430, maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:19, color:C.text }}>{title}</div>
          <button type="button" onClick={onClose} style={{ background:'transparent', border:'none', color:C.textS, fontSize:22, cursor:'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── PhotoSlot ─────────────────────────────────────────
export function PhotoSlot({ url, label, onUpload, loading }) {
  return (
    <div style={{ width:'100%', aspectRatio:'3/4', borderRadius:10, background:url?`${C.ok}15`:C.surf, border:`1px dashed ${url?C.ok:C.borderM}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, cursor:'pointer', overflow:'hidden', position:'relative' }}
      onClick={!url&&!loading?onUpload:undefined}>
      {url ? (
        <img src={url} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
      ) : (
        <>
          <div style={{ fontSize:18, color:loading?C.limen:C.textM }}>{loading?'..':'+'}</div>
          <div style={{ color:loading?C.limen:C.textM, fontSize:10 }}>{loading?'Enviando...':label}</div>
        </>
      )}
    </div>
  )
}

// ─── ErrorMessage ──────────────────────────────────────
export function ErrorMessage({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background:`${C.rose}15`, border:`1px solid ${C.rose}30`, borderRadius:9, padding:'10px 12px' }}>
      <span style={{ color:C.rose, fontSize:12 }}>{msg}</span>
    </div>
  )
}
