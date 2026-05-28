import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import api from '../api';

const COULEURS  = ['#E60000','#FF6B35','#4895EF','#7209B7','#4CC9F0','#22c55e','#f59e0b','#ec4899'];
const OBJ_TYPES = ['distance','calories','frequence','poids','vitesse','cardio'];
const ACT_TYPES = ['Tous','Course','Velo','Natation','Muscu','Yoga'];
const EMPTY     = { titre:'', type:'distance', type_activite:'Tous', cible:'', actuel:'', unite:'km', statut:'en_cours', couleur:'#E60000', date_fin:'' };

const pct = (a,b) => b>0 ? Math.min(Math.round((a/b)*100),100) : 0;

const ProgressBar = ({ val, color }) => (
  <div style={{background:'#1c2230',borderRadius:20,height:7,overflow:'hidden',marginTop:8}}>
    <div style={{width:`${val}%`,height:'100%',background:color,borderRadius:20,transition:'width .6s'}}/>
  </div>
);

const Modal = ({ title, form, onChange, onSave, onClose, saving }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'1rem'}} onClick={onClose}>
    <div style={{background:'#10131a',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}} onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1.1rem 1.4rem',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
        <h3 style={{margin:0,fontSize:'1rem',fontWeight:700}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#525c74',fontSize:'1rem',cursor:'pointer',padding:'.2rem .4rem',borderRadius:6}}>✕</button>
      </div>
      <div style={{padding:'1.2rem 1.4rem',display:'flex',flexDirection:'column',gap:'.85rem'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
          <label style={{fontSize:'.78rem',color:'#525c74'}}>Titre *</label>
          <input name="titre" value={form.titre} onChange={onChange} placeholder="Ex : Courir 50 km ce mois" style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Type *</label>
            <select name="type" value={form.type} onChange={onChange} style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}>
              {OBJ_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Activité</label>
            <select name="type_activite" value={form.type_activite} onChange={onChange} style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}>
              {ACT_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Objectif cible *</label>
            <input type="number" name="cible" value={form.cible} onChange={onChange} placeholder="50" style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Valeur actuelle</label>
            <input type="number" name="actuel" value={form.actuel} onChange={onChange} placeholder="0" style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Unité</label>
            <input name="unite" value={form.unite} onChange={onChange} placeholder="km, kcal..." style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Date limite</label>
            <input name="date_fin" value={form.date_fin} onChange={onChange} placeholder="31 jan" style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Statut</label>
            <select name="statut" value={form.statut} onChange={onChange} style={{background:'#060709',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'.58rem .85rem',color:'#f2f2f5',fontSize:'.87rem'}}>
              <option value="en_cours">En cours</option>
              <option value="atteint">Atteint ✅</option>
            </select>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            <label style={{fontSize:'.78rem',color:'#525c74'}}>Couleur</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
              {COULEURS.map(c=>(
                <span key={c} onClick={()=>onChange({target:{name:'couleur',value:c}})}
                  style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',border:form.couleur===c?'3px solid #fff':'2px solid transparent',transition:'transform .15s',transform:form.couleur===c?'scale(1.2)':'scale(1)'}}/>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:'.6rem',padding:'.9rem 1.4rem',borderTop:'1px solid rgba(255,255,255,.07)'}}>
        <button onClick={onClose} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',color:'#9aa0b4',borderRadius:10,padding:'.5rem 1.1rem',cursor:'pointer',fontSize:'.85rem',fontWeight:600}}>Annuler</button>
        <button onClick={onSave} disabled={saving} style={{background:'#E60000',color:'#fff',border:'none',borderRadius:10,padding:'.5rem 1.2rem',cursor:'pointer',fontSize:'.85rem',fontWeight:600,opacity:saving?.5:1}}>
          {saving?'⏳ ...':'✅ Sauvegarder'}
        </button>
      </div>
    </div>
  </div>
);

const Objectifs = () => {
  const toast = useToast();
  const [objectifs, setObjectifs] = useState([]);
  const [filtre,    setFiltre]    = useState('tous');
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [confirm,   setConfirm]   = useState(null);

  const load = () => api.getObjectifs().then(setObjectifs).catch(()=>{});
  useEffect(()=>{ load(); },[]);

  const ch = e => setForm({...form,[e.target.name]:e.target.value});
  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = o => { setForm({titre:o.titre,type:o.type,type_activite:o.type_activite||'Tous',cible:o.cible,actuel:o.actuel,unite:o.unite,statut:o.statut,couleur:o.couleur||'#E60000',date_fin:o.date_fin||''}); setEditId(o.id); setModal(true); };

  const save = async () => {
    if (!form.titre||!form.cible) return toast.err('Titre et cible obligatoires');
    setSaving(true);
    try {
      if (!editId) await api.createObjectif(form); else await api.updateObjectif(editId,form);
      await load(); setModal(false); toast.ok(editId?'Objectif modifié ✅':'Objectif créé ✅');
    } catch(e){ toast.err(e.response?.data?.error||'Erreur'); }
    setSaving(false);
  };

  const del = async id => { try{ await api.deleteObjectif(id); await load(); toast.ok('Supprimé'); } catch{ toast.err('Erreur'); } setConfirm(null); };
  const mark = async o => { try{ await api.updateObjectif(o.id,{...o,statut:'atteint',actuel:o.cible}); await load(); toast.ok('Objectif atteint 🎉'); } catch{ toast.err('Erreur'); } };

  const shown = filtre==='tous' ? objectifs : objectifs.filter(o=>o.statut===filtre);
  const total = objectifs.length;
  const atteints = objectifs.filter(o=>o.statut==='atteint').length;

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1.6rem'}}>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.7rem',fontWeight:800}}>Mes <strong>Objectifs</strong></h1>
            <p style={{color:'#525c74',fontSize:'.85rem',marginTop:4}}>Définissez et suivez vos objectifs de performance</p>
          </div>
          <button onClick={openAdd} style={{background:'#E60000',color:'#fff',border:'none',borderRadius:10,padding:'.6rem 1.3rem',fontWeight:600,fontSize:'.88rem',cursor:'pointer'}}>+ Nouvel objectif</button>
        </div>

        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
          {[{l:'Total',v:total,c:'#E60000'},{l:'Atteints ✅',v:atteints,c:'#22c55e'},{l:'En cours',v:total-atteints,c:'#3b82f6'}].map(k=>(
            <div key={k.l} style={{background:'#10131a',border:`1px solid rgba(255,255,255,.07)`,borderLeft:`4px solid ${k.c}`,borderRadius:14,padding:'1rem 1.3rem'}}>
              <div style={{fontSize:'1.6rem',fontWeight:900,fontFamily:"'Syne',sans-serif",color:k.c}}>{k.v}</div>
              <div style={{fontSize:'.78rem',color:'#525c74',marginTop:4}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'1.3rem'}}>
          {[['tous','Tous'],['en_cours','En cours'],['atteint','Atteints']].map(([k,l])=>(
            <button key={k} onClick={()=>setFiltre(k)} style={{background:filtre===k?'#E60000':'#161b24',color:filtre===k?'#fff':'#525c74',border:filtre===k?'1px solid #E60000':'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:'.3rem .9rem',fontSize:'.82rem',fontWeight:500,cursor:'pointer',transition:'all .2s'}}>{l}</button>
          ))}
        </div>

        {/* Grille objectifs */}
        {shown.length===0
          ? <div style={{textAlign:'center',padding:'3rem',color:'#525c74'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'1rem',opacity:.4}}>🎯</div>
              <p style={{marginBottom:'1rem'}}>Aucun objectif défini.</p>
              <button onClick={openAdd} style={{background:'#E60000',color:'#fff',border:'none',borderRadius:10,padding:'.6rem 1.3rem',fontWeight:600,cursor:'pointer'}}>Créer mon premier objectif</button>
            </div>
          : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
              {shown.map(o=>{
                const p = pct(o.actuel, o.cible);
                return (
                  <div key={o.id} style={{background:'#10131a',border:'1px solid rgba(255,255,255,.07)',borderLeft:`4px solid ${o.couleur||'#E60000'}`,borderRadius:14,padding:'1.1rem',transition:'all .2s'}}>
                    {/* Titre + actions */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <div>
                        <h3 style={{margin:'0 0 6px',fontSize:'.95rem',fontWeight:700,color:'#f2f2f5'}}>{o.titre}</h3>
                        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                          <span style={{background:o.statut==='atteint'?'rgba(34,197,94,.15)':'rgba(59,130,246,.15)',color:o.statut==='atteint'?'#22c55e':'#3b82f6',padding:'.12rem .5rem',borderRadius:4,fontSize:'.72rem',fontWeight:600}}>
                            {o.statut==='atteint'?'Atteint ✅':'En cours'}
                          </span>
                          {o.type_activite&&o.type_activite!=='Tous'&&<span style={{background:'rgba(230,0,0,.12)',color:'#E60000',padding:'.12rem .5rem',borderRadius:4,fontSize:'.72rem',fontWeight:600}}>{o.type_activite}</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:4}}>
                        {o.statut==='en_cours'&&<button onClick={()=>mark(o)} title="Marquer atteint" style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem',padding:'.2rem .3rem',borderRadius:6}}>✅</button>}
                        <button onClick={()=>openEdit(o)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem',padding:'.2rem .3rem',borderRadius:6}}>✏️</button>
                        <button onClick={()=>setConfirm(o.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1rem',padding:'.2rem .3rem',borderRadius:6}}>🗑️</button>
                      </div>
                    </div>
                    {/* Valeurs */}
                    <div style={{display:'flex',alignItems:'baseline',gap:8,margin:'10px 0 8px'}}>
                      <span style={{fontSize:'1.3rem',fontWeight:800,fontFamily:"'Syne',sans-serif",color:o.couleur||'#E60000'}}>{o.actuel} {o.unite}</span>
                      <span style={{fontSize:'.85rem',color:'#525c74'}}>/ {o.cible} {o.unite}</span>
                      {o.date_fin&&<span style={{fontSize:'.72rem',color:'#525c74',marginLeft:'auto'}}>📅 {o.date_fin}</span>}
                    </div>
                    {/* Barre progression */}
                    <ProgressBar val={p} color={o.couleur||'#E60000'}/>
                    <div style={{textAlign:'right',fontSize:'.72rem',color:'#525c74',marginTop:4}}>{p}%</div>
                  </div>
                );
              })}
            </div>
        }

        {/* Modal */}
        {modal && <Modal title={editId?"Modifier l'objectif":"Nouvel objectif"} form={form} onChange={ch} onSave={save} onClose={()=>setModal(false)} saving={saving}/>}

        {/* Confirm suppression */}
        {confirm && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}}>
            <div style={{background:'#10131a',border:'1px solid rgba(255,255,255,.12)',borderRadius:16,padding:'1.5rem',maxWidth:340,textAlign:'center'}}>
              <h3 style={{marginBottom:8}}>Supprimer cet objectif ?</h3>
              <p style={{color:'#525c74',fontSize:'.85rem',marginBottom:'1.5rem'}}>Cette action est irréversible.</p>
              <div style={{display:'flex',justifyContent:'center',gap:'.7rem'}}>
                <button onClick={()=>setConfirm(null)} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',color:'#9aa0b4',borderRadius:10,padding:'.5rem 1.1rem',cursor:'pointer',fontWeight:600}}>Annuler</button>
                <button onClick={()=>del(confirm)} style={{background:'rgba(230,0,0,.15)',color:'#ff7070',border:'1px solid rgba(230,0,0,.3)',borderRadius:10,padding:'.5rem 1.1rem',cursor:'pointer',fontWeight:600}}>🗑️ Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default Objectifs;
