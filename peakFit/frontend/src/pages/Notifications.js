import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useToast } from '../context/ToastContext';
import { NOTIF_COLORS, NOTIF_ICONS } from '../utils/constants';
import api from '../api';

const Notifications = () => {
  const toast  = useToast();
  const [notifs, setNotifs] = useState([]);
  const [filtre, setFiltre] = useState('tous');
  const [settings, setSettings] = useState({ seance:true, hydratation:true, etirements:true, classement:false, badges:true });

  const load = () => api.getNotifications().then(setNotifs).catch(()=>{});
  useEffect(() => { load(); }, []);

  const markRead = async id => {
    try { await api.markRead(id); setNotifs(n=>n.map(x=>x.id===id?{...x,lu:true}:x)); }
    catch {}
  };
  const markAll = async () => {
    try { await api.markAllRead(); setNotifs(n=>n.map(x=>({...x,lu:true}))); toast.ok('Toutes lues ✅'); }
    catch { toast.err('Erreur'); }
  };

  const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); } catch { return ''; } };
  const nonLus  = notifs.filter(n=>!n.lu).length;
  const shown   = filtre==='tous' ? notifs : filtre==='nonlus' ? notifs.filter(n=>!n.lu) : notifs.filter(n=>n.type===filtre);

  return (
    <div className="layout">
      <Navigation notifCount={nonLus}/>
      <Sidebar/>
      <main className="content-area">
        <div className="ph">
          <div>
            <h1><strong>Notifications</strong> & Rappels</h1>
            <p>{nonLus>0?`${nonLus} non lue${nonLus>1?'s':''}` : 'Tout est lu ✅'}</p>
          </div>
          {nonLus>0 && <button className="btn btn-ghost btn-sm" onClick={markAll}>✅ Tout lire</button>}
        </div>

        <div className="filters">
          <button className={`pill ${filtre==='tous'?'on':''}`}    onClick={()=>setFiltre('tous')}>Toutes ({notifs.length})</button>
          <button className={`pill ${filtre==='nonlus'?'on':''}`}  onClick={()=>setFiltre('nonlus')}>Non lues ({nonLus})</button>
          {['objectif','entrainement','hydratation','badge','communaute'].map(t=>(
            <button key={t} className={`pill ${filtre===t?'on':''}`} onClick={()=>setFiltre(t)}>{t}</button>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'.5rem',marginBottom:'1.5rem'}}>
          {shown.length===0
            ? <div className="card empty"><div className="ei">🎉</div><p>Aucune notification ici</p></div>
            : shown.map(n=>(
              <div key={n.id} className={`notif-item ${n.lu?'read':'unread'}`} onClick={()=>!n.lu&&markRead(n.id)}>
                <div className="notif-ico" style={{background:`${NOTIF_COLORS[n.type]||'#555'}22`,color:NOTIF_COLORS[n.type]||'#aaa'}}>
                  {NOTIF_ICONS[n.type]||'🔔'}
                </div>
                <div className="notif-body">
                  <div className="notif-title">{n.titre}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-date">{fmtDate(n.created_at||n.date)}</div>
                </div>
                {!n.lu && <div className="notif-dot"/>}
              </div>
            ))
          }
        </div>

        <div className="card">
          <h2>⚙️ Paramètres des rappels</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'.3rem',marginTop:'.5rem'}}>
            {[
              {k:'seance',    l:'Rappel séance quotidienne'},
              {k:'hydratation',l:'Rappel hydratation (toutes les 2h)'},
              {k:'etirements', l:'Rappel étirements post-séance'},
              {k:'classement', l:'Alertes classement communauté'},
              {k:'badges',     l:'Notifications nouveaux badges'},
            ].map(s=>(
              <div key={s.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.7rem',borderRadius:'var(--r-md)',background:'var(--bg3)'}}>
                <span style={{fontSize:'.87rem',color:'var(--text2)'}}>{s.l}</span>
                <input type="checkbox" checked={settings[s.k]} onChange={()=>setSettings(x=>({...x,[s.k]:!x[s.k]}))} style={{width:'16px',height:'16px',accentColor:'var(--red)',cursor:'pointer'}}/>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Notifications;
