import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import api from '../api';

const MEDAL = { 1:'🥇', 2:'🥈', 3:'🥉' };

const Communaute = () => {
  const [data, setData] = useState({ classement:[], badges:[], defis:[] });
  const [shareMsg, setShareMsg] = useState('');

  useEffect(()=>{ api.getCommunaute().then(setData).catch(()=>{}); },[]);

  const share = msg => {
    setShareMsg(msg);
    navigator.clipboard?.writeText(msg).catch(()=>{});
    setTimeout(()=>setShareMsg(''), 4000);
  };

  const me = data.classement?.find(u=>u.moi);
  const S = { card:{background:'#10131a',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'1.3rem'} };

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        <div style={{marginBottom:'1.6rem'}}>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.7rem',fontWeight:800}}><strong>Communauté</strong> & Partage</h1>
          <p style={{color:'#525c74',fontSize:'.85rem',marginTop:4}}>Classements, défis et badges</p>
        </div>

        {shareMsg && (
          <div style={{background:'rgba(34,197,94,.1)',border:'1px solid #22c55e',borderRadius:10,padding:'.75rem 1rem',marginBottom:'1rem'}}>
            <p style={{color:'#22c55e',margin:'0 0 4px',fontSize:'.82rem',fontWeight:600}}>✅ Copié !</p>
            <code style={{color:'#86efac',fontSize:'.78rem'}}>{shareMsg}</code>
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.2rem',marginBottom:'1.2rem'}}>
          {/* Classement */}
          <div style={S.card}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 1rem'}}>🏆 Classement du mois</p>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {data.classement?.map(u=>(
                <div key={u.rang} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 10px',borderRadius:10,background:u.moi?'rgba(230,0,0,.08)':'transparent',border:u.moi?'1px solid rgba(230,0,0,.2)':'1px solid transparent'}}>
                  <span style={{width:26,textAlign:'center',fontWeight:700}}>{MEDAL[u.rang]||`#${u.rang}`}</span>
                  <span style={{flex:1,fontSize:'.88rem',fontWeight:u.moi?700:500,color:u.moi?'#f2f2f5':'#9aa0b4'}}>
                    {u.nom}{u.moi&&<span style={{color:'#E60000',fontSize:'.7rem',marginLeft:6}}>(Vous)</span>}
                  </span>
                  <span style={{fontSize:'.76rem',color:'#525c74'}}>{u.activites} séances</span>
                  <span style={{fontSize:'.82rem',fontWeight:600,color:u.moi?'#E60000':'#9aa0b4',minWidth:60,textAlign:'right'}}>{Number(u.points||0).toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={S.card}>
            <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 1rem'}}>🎖️ Vos Badges</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8}}>
              {data.badges?.map(b=>(
                <div key={b.id||b.nom} style={{background:b.obtenu?'rgba(245,158,11,.08)':'#161b24',border:b.obtenu?'1px solid rgba(245,158,11,.3)':'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'.85rem .7rem',textAlign:'center',opacity:b.obtenu?1:.5,position:'relative'}}>
                  <div style={{fontSize:'1.6rem',marginBottom:5}}>{b.icone}</div>
                  <div style={{fontSize:'.78rem',fontWeight:700,color:'#f2f2f5',marginBottom:3}}>{b.nom}</div>
                  <div style={{fontSize:'.67rem',color:'#525c74',lineHeight:1.3}}>{b.descr||b.desc}</div>
                  {!b.obtenu && <span style={{position:'absolute',top:5,right:7,fontSize:'.75rem'}}>🔒</span>}
                  {b.obtenu&&b.date_obtenu&&<div style={{fontSize:'.65rem',color:'#f59e0b',marginTop:4}}>{String(b.date_obtenu).slice(0,10)}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Défis */}
        <div style={{...S.card,marginBottom:'1.2rem'}}>
          <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 1rem'}}>⚡ Défis en cours</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {data.defis?.map(d=>{
              const p = Math.min((d.progression/d.total)*100,100);
              return (
                <div key={d.id} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'1rem',opacity:d.actif?1:.6}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:10}}>
                    <span style={{flex:1,fontSize:'.9rem',fontWeight:600,color:'#f2f2f5'}}>{d.titre}</span>
                    <span style={{fontSize:'.75rem',color:'#525c74'}}>👥 {d.participants}</span>
                    <span style={{background:d.actif?'rgba(34,197,94,.12)':'#1c2230',color:d.actif?'#22c55e':'#525c74',padding:'.1rem .5rem',borderRadius:4,fontSize:'.72rem',fontWeight:600}}>{d.actif?'En cours':'Terminé'}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,background:'#1c2230',borderRadius:20,height:7,overflow:'hidden'}}>
                      <div style={{width:`${p}%`,height:'100%',background:d.actif?'#E60000':'#525c74',borderRadius:20}}/>
                    </div>
                    <span style={{fontSize:'.76rem',color:'#525c74',whiteSpace:'nowrap'}}>{p.toFixed(0)}% · {d.progression}/{d.total} {d.unite}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partage */}
        <div style={S.card}>
          <p style={{fontSize:'.75rem',fontWeight:600,color:'#9aa0b4',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .8rem'}}>📤 Partager</p>
          <div style={{display:'flex',gap:'.7rem',flexWrap:'wrap'}}>
            {[
              {l:'📊 Ma semaine',     msg:`🏋️ Cette semaine : ${me?.activites||0} séances sur PeakFit ! 💪 #PeakFit`},
              {l:'🏆 Mon classement', msg:`Je suis #${me?.rang||'?'} du classement avec ${Number(me?.points||0).toLocaleString()} pts ! #PeakFit`},
              {l:'📨 Inviter',        msg:'🏋️ Rejoins-moi sur PeakFit pour suivre tes activités sportives ! #PeakFit'},
            ].map(b=>(
              <button key={b.l} onClick={()=>share(b.msg)} style={{background:'#161b24',border:'1px solid rgba(255,255,255,.07)',color:'#9aa0b4',borderRadius:10,padding:'.55rem 1rem',fontSize:'.84rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#E60000';e.currentTarget.style.color='#E60000';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.07)';e.currentTarget.style.color='#9aa0b4';}}
              >{b.l}</button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Communaute;
