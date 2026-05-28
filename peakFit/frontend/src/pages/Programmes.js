import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Sidebar from '../components/Sidebar';
import api from '../api';

const INTENSITE_COLOR = { Faible:'#22c55e', Moderee:'#f59e0b', Elevee:'#E60000', Maximale:'#7209B7' };
const OBJECTIFS_LIST  = ['Course','Velo','Natation','Musculation','Yoga','Perte de poids','Prise de masse'];
const EMPTY_PROG = { nom:'', description:'', objectif:'Course', duree_weeks:8 };

const Modal = ({ title, form, onChange, onSave, onClose, saving }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
      <div className="modal-body">
        <div className="fg"><label>Nom du programme *</label>
          <input name="nom" value={form.nom} onChange={onChange} placeholder="Ex : Prépa 10km" required />
        </div>
        <div className="fg"><label>Description</label>
          <input name="description" value={form.description} onChange={onChange} placeholder="Objectifs et détails..." />
        </div>
        <div className="row2">
          <div className="fg"><label>Objectif sportif</label>
            <select name="objectif" value={form.objectif} onChange={onChange}>
              {OBJECTIFS_LIST.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="fg"><label>Durée (semaines)</label>
            <input type="number" name="duree_weeks" value={form.duree_weeks} onChange={onChange} min="1" max="52" />
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving?'⏳...':'✅ Créer'}</button>
      </div>
    </div>
  </div>
);

const Programmes = () => {
  const [programmes, setProgrammes] = useState([]);
  const [selected, setSelected]     = useState(0);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(EMPTY_PROG);
  const [saving, setSaving]         = useState(false);

  const load = () => api.getProgrammes().then(p => { setProgrammes(p); });
  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

  const handleCreate = async () => {
    if (!form.nom) return alert('Nom obligatoire !');
    setSaving(true);
    try { await api.createProgramme(form); await load(); setModal(false); setForm(EMPTY_PROG); }
    catch(e) { alert('Erreur : '+(e.response?.data?.error||e.message)); }
    setSaving(false);
  };

  const handleToggleSeance = async (seanceId, fait) => {
    try { await api.toggleSeance(seanceId, !fait); await load(); }
    catch { alert('Erreur mise à jour séance'); }
  };

  const prog = programmes[selected];

  return (
    <div className="layout">
      <Navigation />
      <Sidebar />
      <div className="content-area">
        <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div><h1>Programmes <strong>d'Entraînement</strong></h1><p>Plans personnalisés adaptés à vos objectifs</p></div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Créer un programme</button>
        </div>

        {programmes.length === 0 ? (
          <div className="card empty">
            <p>📋 Aucun programme créé.</p>
            <button className="btn btn-primary" onClick={() => setModal(true)}>Créer mon premier programme</button>
          </div>
        ) : (
          <>
            <div className="filters">
              {programmes.map((p,i) => (
                <button key={p.id} className={`pill ${selected===i?'active':''}`} onClick={() => setSelected(i)}>{p.nom}</button>
              ))}
            </div>

            {prog && (
              <>
                <div className="card programme-header-card">
                  <div className="programme-meta">
                    <h2>{prog.nom}</h2>
                    <p style={{color:'#9ca3af'}}>{prog.description}</p>
                    <div className="programme-stats">
                      <span>🎯 {prog.objectif}</span>
                      <span>📅 {prog.duree_weeks} semaines</span>
                      <span>📍 Semaine {prog.semaine_courante} / {prog.duree_weeks}</span>
                      <span>✅ {(prog.seances||[]).filter(s=>s.fait).length} / {(prog.seances||[]).length} séances</span>
                    </div>
                  </div>
                  <div className="programme-progress">
                    <div className="prog-progress-bar-bg">
                      <div className="prog-progress-bar-fill" style={{width:`${(prog.semaine_courante/prog.duree_weeks)*100}%`}} />
                    </div>
                    <span>{Math.round((prog.semaine_courante/prog.duree_weeks)*100)}% complété</span>
                  </div>
                </div>

                <div className="card">
                  <h2>Séances — Semaine {prog.semaine_courante}
                    <span style={{fontSize:'.8rem',color:'#5a6478',fontWeight:400,marginLeft:'1rem'}}>Cliquer sur une séance pour la marquer comme effectuée</span>
                  </h2>
                  {(prog.seances||[]).length === 0
                    ? <p style={{color:'#5a6478'}}>Aucune séance dans ce programme.</p>
                    : (
                      <div className="seances-grid">
                        {prog.seances.map((s) => (
                          <div key={s.id} className={`seance-card ${s.fait?'fait':''}`}
                            onClick={() => handleToggleSeance(s.id, s.fait)} style={{cursor:'pointer'}}>
                            <div className="seance-jour">{s.jour}</div>
                            <div className="seance-titre">{s.titre}</div>
                            <div className="seance-meta">
                              <span>⏱ {s.duree_min} min</span>
                              <span className="intensite-badge" style={{background:INTENSITE_COLOR[s.intensite]}}>{s.intensite}</span>
                            </div>
                            <div className={`seance-status ${s.fait?'done':'todo'}`}>
                              {s.fait ? '✅ Effectuée' : '⏳ À faire'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>

                <div className="card">
                  <h2>Recommandations personnalisées</h2>
                  <div className="conseils-list">
                    <div className="conseil-item">💡 Échauffement obligatoire de 10 min avant chaque séance</div>
                    <div className="conseil-item">💧 Hydratez-vous : 500ml avant, 250ml toutes les 20 min</div>
                    <div className="conseil-item">😴 Respectez les jours de repos prévus au programme</div>
                    <div className="conseil-item">📈 Augmentez l'intensité progressivement selon les semaines</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {modal && <Modal title="Nouveau programme" form={form} onChange={handleChange}
        onSave={handleCreate} onClose={() => setModal(false)} saving={saving} />}
    </div>
  );
};

export default Programmes;
