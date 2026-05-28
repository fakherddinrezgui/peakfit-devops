import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
         ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import api from '../api';
import { trend } from '../utils/constants';

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return <div style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px',padding:'.65rem .9rem'}}>
    <p style={{fontSize:'.73rem',color:'var(--text3)',marginBottom:'.3rem'}}>{label}</p>
    {payload.map((p,i)=><p key={i} style={{fontSize:'.83rem',color:p.color||'#fff',fontWeight:600}}>{p.name}: {typeof p.value==='number'?p.value.toLocaleString():p.value}</p>)}
  </div>;
};

const Performances = () => {
  const [data, setData] = useState(null);
  const [periode, setPeriode] = useState('activites');

  useEffect(() => { api.getStats().then(setData).catch(()=>{}); }, []);

  if (!data) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg0)'}}><div style={{width:'34px',height:'34px',border:'3px solid #E60000',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;

  const mon  = data.monthly   || [];
  const perf = data.performance || [];
  const avg  = data.averageSession || [];
  const mois = data.mois     || {};
  const prev = data.prevMois || {};
  const last = mon[mon.length-1] || {};
  const prv  = mon[mon.length-2] || {};

  const PERIODS = [
    {k:'activites',label:'Séances'},
    {k:'distanceKm',label:'Distance (km)'},
    {k:'calories',label:'Calories (kcal)'},
    {k:'dureeH',label:'Durée (h)'},
  ];

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        <div className="ph">
          <div><h1>Analyse des <strong>Performances</strong></h1><p>Évolutions, comparaisons et indicateurs clés</p></div>
        </div>

        {/* KPIs du mois */}
        <div className="kpi-row">
          {[
            {ico:'🏃',label:'Séances ce mois',    v:mois.activites||0,  u:'',    tr:trend(mois.activites,prev.activites),   c:'#E60000'},
            {ico:'📍',label:'Distance ce mois',   v:mois.distanceKm||0, u:' km', tr:trend(mois.distanceKm,prev.distanceKm), c:'#4895EF'},
            {ico:'🔥',label:'Calories ce mois',   v:Number(mois.calories||0).toLocaleString(), u:' kcal', tr:trend(mois.calories,prev.calories), c:'#FF6B35'},
            {ico:'⏱️', label:'Heures ce mois',    v:mois.dureeH||0,     u:' h',  c:'#7209B7'},
          ].map(k=>(
            <div key={k.label} className="kpi">
              <div className="kpi-ico" style={{background:`${k.c}18`}}>{k.ico}</div>
              <div className="kpi-body">
                <div className="kpi-v">{k.v}<span className="kpi-u">{k.u}</span></div>
                <div className="kpi-l">{k.label}</div>
                {k.tr!==undefined && <div className={`kpi-t ${k.tr>0?'up':k.tr<0?'dn':'neu'}`}>{k.tr>0?'▲':k.tr<0?'▼':'→'} {Math.abs(k.tr)}% vs mois prec.</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Filtre période */}
        <div className="filters">
          {PERIODS.map(p=>(
            <button key={p.k} className={`pill ${periode===p.k?'on':''}`} onClick={()=>setPeriode(p.k)}>{p.label}</button>
          ))}
        </div>

        {/* Évolution mensuelle */}
        <div className="card" style={{marginBottom:'1.2rem'}}>
          <h2>Évolution mensuelle — {PERIODS.find(p=>p.k===periode)?.label}</h2>
          {mon.length===0
            ? <div className="empty"><div className="ei">📈</div><p>Ajoutez des activités pour voir l'évolution</p></div>
            : <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mon} margin={{top:10,right:20,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <Tooltip content={<TT/>}/>
                  <Line type="monotone" dataKey={periode} name={PERIODS.find(p=>p.k===periode)?.label} stroke="#E60000" strokeWidth={2.5} dot={{r:4,fill:'#E60000'}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="grid2">
          {/* Durée moy par jour */}
          <div className="card">
            <h2>Durée moyenne par jour de semaine</h2>
            {avg.length===0
              ? <div className="empty"><p>Aucune donnée</p></div>
              : <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={avg}>
                    <XAxis dataKey="dayWeek" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                    <YAxis axisLine={false} tickLine={false} unit="min" tick={{fill:'#525c74',fontSize:11}}/>
                    <Tooltip formatter={v=>[`${v} min`,'Durée']} contentStyle={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px'}}/>
                    <Bar dataKey="sessionLength" fill="#4895EF" radius={[4,4,0,0]} barSize={26}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </div>

          {/* Radar */}
          <div className="card">
            <h2>Profil de performance (6 axes)</h2>
            {perf.length===0
              ? <div className="empty"><p>Ajoutez des activités</p></div>
              : <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={perf} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,.06)"/>
                    <PolarAngleAxis dataKey="kind" tick={{fill:'#9aa0b4',fontSize:11}}/>
                    <PolarRadiusAxis axisLine={false} tick={false} domain={[0,100]}/>
                    <Radar dataKey="value" stroke="#E60000" fill="#E60000" fillOpacity={0.35} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Comparaison mois */}
        <div className="card" style={{marginTop:'1.2rem'}}>
          <h2>Ce mois vs mois précédent</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem',marginTop:'.5rem'}}>
            {[
              {label:'Séances',    cur:mois.activites,   prv:prev.activites,   u:''},
              {label:'Distance',   cur:mois.distanceKm,  prv:prev.distanceKm,  u:' km'},
              {label:'Calories',   cur:mois.calories,    prv:prev.calories,    u:' kcal'},
              {label:'Durée',      cur:mois.dureeH,      prv:prev.dureeH,      u:' h'},
            ].map(({label,cur,prv,u})=>{
              const t = trend(cur,prv);
              return (
                <div key={label} style={{background:'var(--bg3)',borderRadius:'var(--r-md)',padding:'1rem',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'.75rem',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.4rem'}}>{label}</div>
                  <div style={{fontSize:'1.4rem',fontWeight:800,fontFamily:"'Syne',sans-serif"}}>{typeof cur==='number'?Number(cur).toLocaleString():0}{u}</div>
                  <div style={{fontSize:'.75rem',marginTop:'.3rem',color:t>0?'var(--green)':t<0?'var(--red)':'var(--text3)',fontWeight:600}}>
                    {t>0?'▲':t<0?'▼':'→'} {Math.abs(t)}% <span style={{color:'var(--text3)',fontWeight:400}}>vs {typeof prv==='number'?Number(prv).toLocaleString():0}{u}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};
export default Performances;
