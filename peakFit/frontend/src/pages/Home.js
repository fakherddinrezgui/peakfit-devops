import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
         RadialBarChart, RadialBar, PolarAngleAxis as PAX, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer, PolarRadiusAxis, Cell } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { ACT_COLORS, trend } from '../utils/constants';
import api from '../api';

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px',padding:'.65rem .9rem'}}>
      <p style={{fontSize:'.73rem',color:'var(--text3)',marginBottom:'.3rem'}}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{fontSize:'.83rem',color:p.color||'#fff',fontWeight:600}}>{p.name}: {typeof p.value==='number'?p.value.toLocaleString():p.value}</p>)}
    </div>
  );
};

const KPI = ({ico,label,value,unit,tr,color}) => (
  <div className="kpi">
    <div className="kpi-ico" style={{background:`${color}18`}}>{ico}</div>
    <div className="kpi-body">
      <div className="kpi-v">{typeof value==='number'?value.toLocaleString():value}<span className="kpi-u">{unit}</span></div>
      <div className="kpi-l">{label}</div>
      {tr!==undefined && <div className={`kpi-t ${tr>0?'up':tr<0?'dn':'neu'}`}>{tr>0?'▲':tr<0?'▼':'→'} {Math.abs(tr)}% ce mois</div>}
    </div>
  </div>
);

const Home = () => {
  const { user }  = useAuth();
  const [data, setData] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    Promise.all([api.getStats(), api.getNotifications()])
      .then(([s, notifs]) => {
        setData(s);
        setNotifCount((notifs||[]).filter(n=>!n.lu).length);
      }).catch(()=>{});
  }, []);

  const s     = data;
  const tot   = s?.total || {};
  const mois  = s?.mois  || {};
  const prev  = s?.prevMois || {};
  const score = s?.todayScore || user?.today_score || 0;
  const perf  = s?.performance || [];
  const avg   = s?.averageSession || [];
  const mon   = s?.monthly || [];
  const types = s?.typeStats || [];

  const sessions7 = (s?.monthly || []).slice(-2);

  const loading = !data;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg0)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'38px',height:'38px',border:'3px solid #E60000',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 1rem'}}/>
        <p style={{color:'var(--text3)',fontSize:'.85rem'}}>Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="layout">
      <Navigation notifCount={notifCount}/>
      <Sidebar/>
      <main className="content-area">

        {/* Bienvenue */}
        <div style={{marginBottom:'1.6rem'}}>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'1.8rem',fontWeight:800}}>
            Bonjour, <strong>{user?.first_name||'Athlète'}</strong> 👋
          </h1>
          <p style={{color:'var(--text3)',fontSize:'.85rem',marginTop:'.25rem'}}>
            {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            {notifCount>0 && <span style={{marginLeft:'.8rem',background:'rgba(230,0,0,.15)',color:'var(--red)',padding:'.1rem .5rem',borderRadius:'4px',fontSize:'.73rem',fontWeight:600}}>{notifCount} notification{notifCount>1?'s':''} non lue{notifCount>1?'s':''}</span>}
          </p>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <KPI ico="🏃" label="Activités totales"   value={tot.activites||0}                       unit=" séances"  tr={trend(mois.activites,prev.activites)}  color="#E60000"/>
          <KPI ico="📍" label="Distance totale"      value={tot.distanceKm||0}                      unit=" km"       tr={trend(mois.distanceKm,prev.distanceKm)} color="#4895EF"/>
          <KPI ico="🔥" label="Calories brûlées"     value={Number(tot.calories||0).toLocaleString()} unit=" kcal"  tr={trend(mois.calories,prev.calories)}    color="#FF6B35"/>
          <KPI ico="⏱️"  label="Heures d'activité"   value={tot.dureeH||0}                          unit=" h"       color="#7209B7"/>
          <KPI ico="💓" label="FC moyenne"            value={tot.fcMoyenne||0}                       unit=" bpm"     color="#E60000"/>
          <KPI ico="⚡" label="Vitesse moyenne"       value={tot.vitesseMoyenne||0}                  unit=" km/h"    color="#4CC9F0"/>
        </div>

        <div className="grid2" style={{marginBottom:'1.2rem'}}>
          {/* Activités + poids 7 derniers jours */}
          <div className="card" style={{gridColumn:'1'}}>
            <div className="card-title"><h2>Activités récentes — Calories & Poids</h2></div>
            {!s?.monthly?.length
              ? <div className="empty"><div className="ei">🏃</div><p>Ajoutez votre première activité</p></div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mon.slice(-7)} margin={{top:5,right:5,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                    <YAxis yAxisId="l" orientation="left"  axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                    <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                    <Tooltip content={<TT/>}/>
                    <Bar yAxisId="r" name="Calories" dataKey="calories"   fill="#E60000" radius={[4,4,0,0]} barSize={14}/>
                    <Bar yAxisId="l" name="Séances"  dataKey="activites"  fill="#4895EF" radius={[4,4,0,0]} barSize={14}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Score du jour */}
          <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <h2 style={{textAlign:'center',marginBottom:'.8rem'}}>Score du jour</h2>
            <div className="score-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{v:Math.round(score*100),fill:'#E60000'}]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0,100]} tick={false}/>
                  <RadialBar background={{fill:'var(--bg4)'}} dataKey="v" cornerRadius={8} fill="#E60000"/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="score-center">
                <span className="score-num">{Math.round(score*100)}%</span>
                <span className="score-sub">de l'objectif</span>
              </div>
            </div>
            <p style={{fontSize:'.82rem',color:'var(--text3)',marginTop:'.6rem'}}>
              {score>=.8?'🔥 Excellent !':score>=.5?'💪 Bien !':score>0?'📈 Continuez !':'🎯 Commencez !'}
            </p>
          </div>
        </div>

        <div className="grid3">
          {/* Radar performance */}
          <div className="card">
            <h2>Profil de performance</h2>
            {perf.length===0
              ? <div className="empty"><div className="ei">📈</div><p>Ajoutez des activités</p></div>
              : <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={perf} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,.06)"/>
                    <PolarAngleAxis dataKey="kind" tick={{fill:'#525c74',fontSize:11}}/>
                    <PolarRadiusAxis axisLine={false} tick={false} domain={[0,100]}/>
                    <Radar dataKey="value" stroke="#E60000" fill="#E60000" fillOpacity={0.35} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Durée moyenne */}
          <div className="card">
            <h2>Durée moy. par jour</h2>
            {avg.length===0
              ? <div className="empty"><p>Aucune donnée</p></div>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={avg}>
                    <XAxis dataKey="dayWeek" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                    <YAxis axisLine={false} tickLine={false} unit="min" tick={{fill:'#525c74',fontSize:11}}/>
                    <Tooltip formatter={v=>[`${v} min`,'Durée']} contentStyle={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px'}}/>
                    <Bar dataKey="sessionLength" fill="#4895EF" radius={[4,4,0,0]} barSize={24}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Répartition par type */}
          <div className="card">
            <h2>Répartition ce mois</h2>
            {types.length===0
              ? <div className="empty"><p>Aucune activité ce mois</p></div>
              : <div style={{display:'flex',flexDirection:'column',gap:'.5rem',marginTop:'.3rem'}}>
                  {types.map(t=>(
                    <div key={t.type}>
                      <div className="prog-label">
                        <span style={{fontSize:'.8rem',display:'flex',alignItems:'center',gap:'.4rem'}}>
                          <span style={{width:'8px',height:'8px',borderRadius:'50%',background:ACT_COLORS[t.type]||'#888',display:'inline-block'}}/>
                          {t.type}
                        </span>
                        <span style={{fontSize:'.78rem',color:'var(--text3)'}}>{t.count} séances</span>
                      </div>
                      <div className="prog-bg">
                        <div className="prog-fill" style={{width:`${Math.min(t.count*10,100)}%`,background:ACT_COLORS[t.type]||'#888'}}/>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

      </main>
    </div>
  );
};
export default Home;
