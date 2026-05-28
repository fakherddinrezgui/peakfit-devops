
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const exportCSV = (rows, name) => {
  if (!rows.length) return alert('Aucune donnée.');
  const csv = [Object.keys(rows[0]).join(','), ...rows.map(r=>Object.values(r).map(v=>`"${v}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
  a.download = name; a.click();
};

const exportPDF = (user, stats, monthly) => {
  const tot = stats.total||{};
  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Rapport PeakFit — ${user?.first_name||''} ${user?.last_name||''}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#111;background:#fff}
    h1{color:#E60000;border-bottom:3px solid #E60000;padding-bottom:10px;font-size:1.8rem}
    h2{color:#333;margin:2rem 0 .8rem;font-size:1.1rem}
    .kpis{display:flex;gap:20px;flex-wrap:wrap;margin:1.5rem 0}
    .kpi{border:2px solid #E60000;border-radius:10px;padding:16px 22px;text-align:center;min-width:130px}
    .kpi-v{font-size:2.2rem;font-weight:900;color:#E60000;line-height:1}
    .kpi-l{font-size:.78rem;color:#666;margin-top:5px}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th{background:#E60000;color:#fff;padding:9px 12px;text-align:left;font-size:.85rem}
    td{padding:8px 12px;border-bottom:1px solid #eee;font-size:.85rem}
    tr:nth-child(even) td{background:#fafafa}
    .footer{margin-top:3rem;font-size:.72rem;color:#aaa;text-align:center;border-top:1px solid #eee;padding-top:1rem}
    @media print{body{margin:15px}}
  </style></head><body>
  <h1>📊 Rapport PeakFit</h1>
  <p style="color:#666"><strong>Athlète :</strong> ${user?.first_name||'—'} ${user?.last_name||''} &nbsp;|&nbsp; <strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  <h2>Statistiques globales</h2>
  <div class="kpis">
    <div class="kpi"><div class="kpi-v">${tot.activites||0}</div><div class="kpi-l">Activités</div></div>
    <div class="kpi"><div class="kpi-v">${tot.distanceKm||0}</div><div class="kpi-l">km parcourus</div></div>
    <div class="kpi"><div class="kpi-v">${Number(tot.calories||0).toLocaleString()}</div><div class="kpi-l">kcal brûlées</div></div>
    <div class="kpi"><div class="kpi-v">${tot.dureeH||0}h</div><div class="kpi-l">d'activité</div></div>
    <div class="kpi"><div class="kpi-v">${tot.fcMoyenne||0}</div><div class="kpi-l">FC moy. (bpm)</div></div>
  </div>
  <h2>Évolution mensuelle</h2>
  <table><thead><tr><th>Mois</th><th>Séances</th><th>Distance (km)</th><th>Calories</th><th>Durée (h)</th></tr></thead>
  <tbody>${monthly.map(m=>`<tr><td>${m.mois||''}</td><td>${m.activites||0}</td><td>${m.distanceKm||0}</td><td>${Number(m.calories||0).toLocaleString()}</td><td>${m.dureeH||0}</td></tr>`).join('')}</tbody></table>
  <div class="footer">Généré le ${new Date().toLocaleString('fr-FR')} — PeakFit v2.0</div>
  </body></html>`);
  win.document.close();
  setTimeout(()=>win.print(), 600);
};

const Rapports = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [acts, setActs] = useState([]);
  const [periode, setPeriode] = useState('tout');

  useEffect(() => {
    api.getStats().then(setData);
    api.getActivities().then(d=>setActs(d.sessions||[]));
  }, []);

  if (!data) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg0)'}}><div style={{width:'34px',height:'34px',border:'3px solid #E60000',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/></div>;

  const tot  = data.total  || {};
  const mon  = data.monthly || [];
  const recs = data.records || [];
  const shown = periode==='tout' ? mon : mon.slice(-3);

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        <div className="ph">
          <div><h1>Rapports & <strong>Statistiques</strong></h1><p>Bilan complet de votre activité sportive</p></div>
        </div>

        <div className="filters">
          {[['tout','Tout temps'],['3mois','3 derniers mois']].map(([k,l])=>(
            <button key={k} className={`pill ${periode===k?'on':''}`} onClick={()=>setPeriode(k)}>{l}</button>
          ))}
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          {[
            {ico:'🏃',l:'Activités totales',  v:tot.activites||0,                        u:' séances', c:'#E60000'},
            {ico:'📍',l:'Distance totale',    v:tot.distanceKm||0,                       u:' km',      c:'#4895EF'},
            {ico:'🔥',l:'Calories brûlées',   v:Number(tot.calories||0).toLocaleString(),u:' kcal',    c:'#FF6B35'},
            {ico:'⏱️', l:"Heures d'activité", v:tot.dureeH||0,                           u:' h',       c:'#7209B7'},
            {ico:'💓',l:'FC moyenne',          v:tot.fcMoyenne||0,                        u:' bpm',     c:'#E60000'},
            {ico:'⚡',l:'Vitesse moy.',        v:tot.vitesseMoyenne||0,                   u:' km/h',    c:'#4CC9F0'},
          ].map(k=>(
            <div key={k.l} className="kpi">
              <div className="kpi-ico" style={{background:`${k.c}18`}}>{k.ico}</div>
              <div className="kpi-body"><div className="kpi-v">{k.v}<span className="kpi-u">{k.u}</span></div><div className="kpi-l">{k.l}</div></div>
            </div>
          ))}
        </div>

        {/* Graphique principal */}
        <div className="card" style={{marginBottom:'1.2rem'}}>
          <h2>Évolution mensuelle — Distance & Séances</h2>
          {shown.length===0
            ? <div className="empty"><div className="ei">📊</div><p>Aucune donnée</p></div>
            : <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shown} margin={{top:10,right:20,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <YAxis yAxisId="l" orientation="left"  axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <Tooltip contentStyle={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px'}}/>
                  <Legend wrapperStyle={{fontSize:'.8rem',paddingTop:'1rem'}}/>
                  <Bar yAxisId="l" dataKey="distanceKm" name="Distance (km)" fill="#E60000" radius={[4,4,0,0]} barSize={18}/>
                  <Bar yAxisId="r" dataKey="activites"  name="Séances"       fill="#4895EF" radius={[4,4,0,0]} barSize={18}/>
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        <div className="grid2">
          {/* Calories évolution */}
          <div className="card">
            <h2>Calories brûlées / mois</h2>
            {shown.length===0 ? <div className="empty"><p>Aucune donnée</p></div> :
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={shown}>
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill:'#525c74',fontSize:11}}/>
                  <Tooltip formatter={v=>[Number(v).toLocaleString()+' kcal']} contentStyle={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'10px'}}/>
                  <Line type="monotone" dataKey="calories" name="Calories" stroke="#FF6B35" strokeWidth={2.5} dot={{r:4,fill:'#FF6B35'}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
            }
          </div>

          {/* Records */}
          <div className="card">
            <h2>🏆 Records personnels</h2>
            {recs.length===0
              ? <div className="empty"><p>Ajoutez des activités pour voir vos records</p></div>
              : <table className="tbl">
                  <thead><tr><th>Activité</th><th>Métrique</th><th>Record</th></tr></thead>
                  <tbody>
                    {recs.slice(0,8).map((r,i)=>(
                      <tr key={i}>
                        <td>{r.type}</td><td style={{color:'var(--text3)'}}>{r.metrique}</td>
                        <td><strong style={{color:'var(--red)'}}>{r.valeur}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>

        {/* Historique */}
        {acts.length > 0 && (
          <div className="card" style={{marginTop:'1.2rem'}}>
            <div className="card-title"><h2>Historique complet ({acts.length} activités)</h2></div>
            <div style={{overflowX:'auto'}}>
              <table className="tbl">
                <thead><tr><th>Date</th><th>Type</th><th>Durée</th><th>Distance</th><th>Calories</th><th>Vitesse moy.</th><th>FC moy.</th></tr></thead>
                <tbody>
                  {[...acts].reverse().slice(0,25).map((a,i)=>(
                    <tr key={i}>
                      <td>{a.day}</td>
                      <td><span className="tag" style={{background:({Course:'#E60000',Velo:'#FF6B35',Natation:'#4895EF',Muscu:'#7209B7',Yoga:'#4CC9F0'})[a.type]||'#888'}}>{a.type}</span></td>
                      <td>{a.dureeMin} min</td>
                      <td>{a.distanceKm>0?`${a.distanceKm} km`:'—'}</td>
                      <td>{Number(a.calories||0).toLocaleString()} kcal</td>
                      <td>{a.vitesseMoy>0?`${a.vitesseMoy} km/h`:'—'}</td>
                      <td>{a.freqCardMoy>0?`${a.freqCardMoy} bpm`:'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export */}
        <div className="card" style={{marginTop:'1.2rem'}}>
          <h2>📤 Exporter les rapports</h2>
          <p style={{color:'var(--text3)',fontSize:'.85rem',marginBottom:'1rem'}}>Téléchargez vos statistiques pour les partager avec un coach ou un médecin.</p>
          <div className="export-btns">
            <button className="exp-btn" onClick={()=>exportPDF(user,data,mon)}>📄 Exporter PDF</button>
            <button className="exp-btn" onClick={()=>exportCSV(acts.map(a=>({Date:a.day,Type:a.type,'Durée min':a.dureeMin,'Distance km':a.distanceKm,Calories:a.calories,'Poids kg':a.kilogram,'Vitesse km/h':a.vitesseMoy,'FC bpm':a.freqCardMoy})),'peakfit_activites.csv')}>📊 Activités CSV</button>
            <button className="exp-btn" onClick={()=>exportCSV(mon.map(m=>({Mois:m.mois,Séances:m.activites,'Distance km':m.distanceKm,Calories:m.calories,'Durée h':m.dureeH})),'peakfit_mensuel.csv')}>📆 Mensuel CSV</button>
          </div>
        </div>

      </main>
    </div>
  );
};
export default Rapports;
