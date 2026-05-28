import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import api from '../api';

const SEV_C = { Legere:'#f59e0b', Moderee:'#E60000', Grave:'#7209B7' };
const CONS_I = { etirement:'🧘', hydratation:'💧', sommeil:'😴', massage:'💆' };
const S = { card:{background:'#10131a',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'1.3rem'} };

const Recuperation = () => {
  const toast = useToast();
  const [recup, setRecup] = useState({ scoreRecup:0, conseils:[], blessures:[], sommeil:[] });
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ zone:'', severite:'Legere', debut:'', notes:'' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.getRecuperation().then(setRecup).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const ch = e => setForm({...form,[e.target.name]:e.target.value});
  const openAdd  = () => { setForm({zone:'',severite:'Legere',debut:new Date().toISOString().slice(0,10),notes:''}); setEditId(null); setModal(true); };
  const openEdit = b => { setForm({zone:b.zone,severite:b.severite,debut:String(b.debut).slice(0,10),notes:b.notes||'',guerison:b.guerison,date_fin:b.date_fin||''}); setEditId(b.id); setModal(true); };

  const save = async () => {
    if (!form.zone||!form.debut) return toast.err('Zone et date obligatoires');
    setSaving(true);
    try {
      if (!editId) await api.createBlessure(form); else await api.updateBlessure(editId,form);
      await load(); setModal(false); toast.ok(editId?'Blessure mise à jour':'Blessure enregistrée');
    } catch(e){ toast.err(e.response?.data?.error||'Erreur'); }
    setSaving(false);
  };

  const markGuerison = async b => {
    try{ await api.updateBlessure(b.id,{...b,guerison:true,date_fin:new Date().toISOString().slice(0,10)}); await load(); toast.ok('Blessure marquée guérie ✅'); }
    catch{ toast.err('Erreur'); }
  };
  const doneConseil = async id => {
    try{ await api.doneConseil(id); await load(); toast.ok('Conseil effectué ✅'); }
    catch{ toast.err('Erreur'); }
  };

  const sc = recup.scoreRecup;
  const scoreColor = sc>=80?'#22c55e':sc>=50?'#f59e0b':'#E60000';

  const inp = {background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem',width:'100%',boxSizing:'border-box'};
  const lbl = {fontSize:'.78rem',color:'#525c74',display:'block',marginBottom:4};

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        <div style={{marginBottom:'1.6rem'}}>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.7rem',fontWeight:800}}>Suivi de la <strong>Récupération</strong></h1>
          <p style={{color:'#525c74',fontSize:'.85rem',marginTop:4}}>Repos, blessures et récupération active</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1.2rem',marginBottom:'1.2rem'}}>
          {/* Score */}
          <div style={{...S.card,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 1.2rem'}}>Score de récupération</p>
            <div style={{width:110,height:110,borderRadius:'50%',border:`6px solid ${scoreColor}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginBottom:12}}>
              <span style={{fontSize:'2rem',fontWeight:900,fontFamily:"'Syne',sans-serif",color:scoreColor,lineHeight:1}}>{sc}</span>
              <span style={{fontSize:'.78rem',color:'#525c74'}}>/100</span>
            </div>
            <p style={{color:scoreColor,fontWeight:600,fontSize:'.88rem'}}>{sc>=80?'Excellente récupération':sc>=50?'Récupération correcte':'Récupération insuffisante'}</p>
          </div>

          {/* Conseils */}
          <div style={S.card}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .8rem'}}>Conseils du jour</p>
            {recup.conseils?.length===0
              ? <p style={{color:'#525c74',fontSize:'.85rem'}}>Aucun conseil pour aujourd'hui.</p>
              : <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {recup.conseils?.map(c=>(
                    <div key={c.id} onClick={()=>!c.fait&&doneConseil(c.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 12px',borderRadius:10,background:'#161b24',cursor:c.fait?'default':'pointer',opacity:c.fait?.6:1,transition:'all .15s'}}
                      onMouseEnter={e=>{if(!c.fait)e.currentTarget.style.background='#1c2230';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='#161b24';}}>
                      <span style={{fontSize:'1.1rem',width:26,textAlign:'center'}}>{CONS_I[c.type]||'✔'}</span>
                      <span style={{flex:1,fontSize:'.87rem',color:'#9aa0b4'}}>{c.titre}</span>
                      <span style={{fontSize:'1rem'}}>{c.fait?'✅':'⬜'}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        {/* Graphique activité */}
        {recup.sommeil?.length>0 && (
          <div style={{...S.card,marginBottom:'1.2rem'}}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .8rem'}}>Durée des activités récentes (h)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={recup.sommeil}>
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                <YAxis axisLine={false} tickLine={false} unit="h" tick={{fill:'#525c74',fontSize:11}}/>
                <Tooltip formatter={v=>[`${v}h`,'Durée']} contentStyle={{background:'#161b24',border:'1px solid rgba(255,255,255,.12)',borderRadius:10}}/>
                <Bar dataKey="heures" fill="#4895EF" radius={[4,4,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Blessures */}
        <div style={S.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:0}}>Journal des blessures</p>
            <button onClick={openAdd} style={{background:'#E60000',color:'#fff',border:'none',borderRadius:10,padding:'.45rem 1rem',fontWeight:600,fontSize:'.82rem',cursor:'pointer'}}>+ Signaler</button>
          </div>
          {recup.blessures?.length===0
            ? <div style={{textAlign:'center',padding:'2rem',color:'#525c74'}}><div style={{fontSize:'2rem',marginBottom:'1rem',opacity:.4}}>🎉</div><p>Aucune blessure enregistrée !</p></div>
            : <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {recup.blessures?.map(b=>(
                  <div key={b.id} style={{background:'#161b24',border:`1px solid ${b.guerison?'rgba(34,197,94,.2)':'rgba(245,158,11,.2)'}`,borderLeft:`3px solid ${b.guerison?'#22c55e':'#f59e0b'}`,borderRadius:12,padding:'1rem',opacity:b.guerison?.7:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:b.notes?6:4}}>
                      <span style={{fontWeight:700,fontSize:'.92rem',color:'#f2f2f5'}}>{b.zone}</span>
                      <span style={{background:`${SEV_C[b.severite]}22`,color:SEV_C[b.severite],padding:'.12rem .55rem',borderRadius:4,fontSize:'.7rem',fontWeight:700}}>{b.severite}</span>
                      <span style={{color:b.guerison?'#22c55e':'#f59e0b',fontSize:'.75rem',fontWeight:600}}>{b.guerison?'Guérie ✅':'Active ⚠️'}</span>
                      <div style={{marginLeft:'auto',display:'flex',gap:4}}>
                        {!b.guerison&&<button onClick={()=>markGuerison(b)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'.9rem',padding:'.2rem .3rem'}}>✅</button>}
                        <button onClick={()=>openEdit(b)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'.9rem',padding:'.2rem .3rem'}}>✏️</button>
                      </div>
                    </div>
                    {b.notes&&<p style={{fontSize:'.82rem',color:'#9aa0b4',margin:'4px 0'}}>{b.notes}</p>}
                    <p style={{fontSize:'.73rem',color:'#525c74',margin:0}}>Début : {String(b.debut).slice(0,10)}{b.date_fin&&` — Fin : ${String(b.date_fin).slice(0,10)}`}</p>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Techniques */}
        <div style={{...S.card,marginTop:'1.2rem'}}>
          <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .8rem'}}>Techniques recommandées</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
            {[['🧊','Cryothérapie','Bain froid 10 min après effort intense'],['🔥','Bain chaud','Détente musculaire après effort modéré'],['🧘','Étirements','15 min quotidiennes minimum'],['💆','Foam roller','Auto-massage 10 min zones sollicitées']].map(([ico,t,d])=>(
              <div key={t} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.85rem',display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:'1.3rem',flexShrink:0}}>{ico}</span>
                <div><div style={{fontSize:'.84rem',fontWeight:600,color:'#f2f2f5',marginBottom:2}}>{t}</div><div style={{fontSize:'.76rem',color:'#525c74'}}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal blessure */}
        {modal && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'1rem'}} onClick={()=>setModal(false)}>
            <div style={{background:'#10131a',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,width:'100%',maxWidth:460,boxShadow:'0 30px 80px rgba(0,0,0,.6)'}} onClick={e=>e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.1rem 1.4rem',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                <h3 style={{margin:0,fontSize:'1rem',fontWeight:700}}>{editId?'Modifier la blessure':'Signaler une blessure'}</h3>
                <button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'#525c74',fontSize:'1rem',cursor:'pointer'}}>✕</button>
              </div>
              <div style={{padding:'1.2rem 1.4rem',display:'flex',flexDirection:'column',gap:'.85rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
                  <div><label style={lbl}>Zone blessée *</label><input name="zone" value={form.zone} onChange={ch} placeholder="Ex : Genou droit" style={inp}/></div>
                  <div><label style={lbl}>Sévérité</label>
                    <select name="severite" value={form.severite} onChange={ch} style={inp}>
                      {['Legere','Moderee','Grave'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={lbl}>Date de début *</label><input type="date" name="debut" value={form.debut} onChange={ch} style={inp}/></div>
                <div><label style={lbl}>Notes</label><input name="notes" value={form.notes} onChange={ch} placeholder="Décrivez la blessure..." style={inp}/></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'.6rem',padding:'.9rem 1.4rem',borderTop:'1px solid rgba(255,255,255,.07)'}}>
                <button onClick={()=>setModal(false)} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',color:'#9aa0b4',borderRadius:10,padding:'.5rem 1.1rem',cursor:'pointer',fontWeight:600,fontSize:'.85rem'}}>Annuler</button>
                <button onClick={save} disabled={saving} style={{background:'#E60000',color:'#fff',border:'none',borderRadius:10,padding:'.5rem 1.2rem',cursor:'pointer',fontWeight:600,fontSize:'.85rem',opacity:saving?.5:1}}>{saving?'⏳ ...':'✅ Sauvegarder'}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default Recuperation;
