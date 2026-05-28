/**
 * BF06 — Nutrition — CRUD repas + hydratation
 */
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar from '../components/Sidebar';
import api from '../api';

const TYPES_REPAS = ['Petit-dejeuner','Dejeuner','Collation','Diner'];
const EMPTY_REPAS = { type:'Dejeuner', nom:'', calories:'', proteines:'', glucides:'', lipides:'', heure:'' };

const MacroBar = ({ label, actuel, objectif, color }) => {
  const pct = objectif > 0 ? Math.min((actuel/objectif)*100, 100) : 0;
  return (
    <div className="macro-item">
      <div className="macro-header"><span>{label}</span><span style={{ color }}>{Math.round(actuel)}g / {objectif}g</span></div>
      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width:`${pct}%`, background:color }} /></div>
    </div>
  );
};

const Nutrition = () => {
  const [nutri, setNutri]   = useState({ objectifCalories:2600, consommeCalories:0, repas:[], macros:{}, objectifMacros:{}, hydratation:{consomme:0,objectif:2.5}, semaine:[] });
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY_REPAS);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => api.getNutrition().then(setNutri);
  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddRepas = async () => {
    if (!form.nom) return alert('Nom du repas obligatoire !');
    setSaving(true);
    try { await api.addRepas(form); await load(); setModal(false); setForm(EMPTY_REPAS); }
    catch(e) { alert('Erreur : ' + (e.response?.data?.error || e.message)); }
    setSaving(false);
  };

  const handleDeleteRepas = async id => {
    try { await api.deleteRepas(id); await load(); }
    catch { alert('Erreur suppression'); }
    setConfirm(null);
  };

  const handleHydratation = async ml => {
    try { await api.addHydratation(ml); await load(); }
    catch(e) { alert('Erreur hydratation'); }
  };

  const calPct = nutri.objectifCalories > 0 ? Math.round((nutri.consommeCalories/nutri.objectifCalories)*100) : 0;
  const macros = nutri.macros || {};
  const objMac = nutri.objectifMacros || { proteines:195, glucides:300, lipides:80 };
  const hydra  = nutri.hydratation || { consomme:0, objectif:2.5 };
  const hydraPct = hydra.objectif > 0 ? Math.min((hydra.consomme/hydra.objectif)*100,100) : 0;

  const repasParType = TYPES_REPAS.map(t => ({
    type: t,
    items: (nutri.repas||[]).filter(r => r.type === t),
    total: (nutri.repas||[]).filter(r => r.type === t).reduce((s,r) => s + (r.calories||0), 0)
  }));

  return (
    <div className="layout">
      <Navigation />
      <Sidebar />
      <div className="content-area">

        <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1>Suivi <strong>Nutritionnel</strong></h1>
            <p>Repas, macronutriments et hydratation du jour</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Ajouter un repas</button>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <div className="stat-card" style={{ borderLeft:'4px solid #E60000' }}>
            <div className="stat-value">{nutri.consommeCalories}<span className="stat-unit"> kcal</span></div>
            <div className="stat-label">Consommées aujourd'hui</div>
          </div>
          <div className="stat-card" style={{ borderLeft:'4px solid #4895EF' }}>
            <div className="stat-value">{nutri.objectifCalories - nutri.consommeCalories}<span className="stat-unit"> kcal</span></div>
            <div className="stat-label">Restantes</div>
          </div>
          <div className="stat-card" style={{ borderLeft:'4px solid #4CC9F0' }}>
            <div className="stat-value">{hydra.consomme}<span className="stat-unit"> L</span></div>
            <div className="stat-label">Eau bue / {hydra.objectif} L</div>
          </div>
        </div>

        <div className="grid2">
          {/* Anneau calories */}
          <div className="card">
            <h2>Bilan calorique du jour</h2>
            <div className="calorie-ring-container">
              <div className="calorie-ring" style={{ background:`conic-gradient(#E60000 0% ${calPct}%, #1a1a2e ${calPct}% 100%)` }}>
                <div className="calorie-ring-inner">
                  <span className="ring-pct">{calPct}%</span>
                  <span className="ring-label">objectif</span>
                </div>
              </div>
            </div>
            <div className="macro-list">
              <MacroBar label="Protéines" actuel={macros.proteines||0} objectif={objMac.proteines||195} color="#E60000" />
              <MacroBar label="Glucides"  actuel={macros.glucides||0}  objectif={objMac.glucides||300}  color="#FF6B35" />
              <MacroBar label="Lipides"   actuel={macros.lipides||0}   objectif={objMac.lipides||80}    color="#4895EF" />
            </div>
          </div>

          {/* Hydratation */}
          <div className="card">
            <h2>Hydratation</h2>
            <div className="hydra-bar-bg">
              <div className="hydra-bar-fill" style={{ width:`${hydraPct}%` }} />
            </div>
            <p style={{ color:'#9ca3af', fontSize:'.9rem', margin:'.5rem 0 1rem' }}>
              {hydra.consomme}L / {hydra.objectif}L ({Math.round(hydraPct)}%)
            </p>
            <div className="hydra-btns">
              {[150, 250, 350, 500].map(ml => (
                <button key={ml} className="btn-hydra" onClick={() => handleHydratation(ml)}>+ {ml}ml</button>
              ))}
            </div>
            {/* Semaine */}
            {(nutri.semaine||[]).length > 0 && (
              <>
                <h3 style={{ marginTop:'1.5rem', fontSize:'.95rem' }}>Calories — 7 derniers jours</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={nutri.semaine}>
                    <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize:11 }} />
                    <YAxis hide />
                    <Tooltip formatter={v => [`${v} kcal`]} />
                    <Bar dataKey="calories" fill="#E60000" radius={4} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>

        {/* Journal repas */}
        <div className="card">
          <h2>Journal alimentaire du jour</h2>
          {nutri.repas?.length === 0 && (
            <div className="empty">
              <p>🍽️ Aucun repas enregistré aujourd'hui.</p>
              <button className="btn btn-primary" onClick={() => setModal(true)}>Ajouter mon premier repas</button>
            </div>
          )}
          {repasParType.map(({ type, items, total }) => items.length > 0 && (
            <div key={type} className="repas-group">
              <div className="repas-group-header">
                <span className="repas-type-label">{type}</span>
                <span className="repas-total">{total} kcal</span>
              </div>
              {items.map(r => (
                <div key={r.id} className="repas-item">
                  <div className="repas-info">
                    <span className="repas-nom">{r.nom}</span>
                    <span className="repas-heure">{r.heure}</span>
                  </div>
                  <div className="repas-macros">
                    <span>🔥 {r.calories} kcal</span>
                    {r.proteines > 0 && <span>P: {r.proteines}g</span>}
                    {r.glucides  > 0 && <span>G: {r.glucides}g</span>}
                    {r.lipides   > 0 && <span>L: {r.lipides}g</span>}
                  </div>
                  <button className="btn-icon delete" onClick={() => setConfirm(r.id)} title="Supprimer">🗑️</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal ajout repas */}
      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Ajouter un repas</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="row2">
                <div className="fg">
                  <label>Type de repas</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    {TYPES_REPAS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fg">
                  <label>Heure</label>
                  <input type="time" name="heure" value={form.heure} onChange={handleChange} />
                </div>
              </div>
              <div className="fg">
                <label>Nom du repas *</label>
                <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex : Riz + poulet + légumes" required />
              </div>
              <div className="row2">
                <div className="fg">
                  <label>Calories (kcal)</label>
                  <input type="number" name="calories" value={form.calories} onChange={handleChange} placeholder="500" min="0" />
                </div>
                <div className="fg">
                  <label>Protéines (g)</label>
                  <input type="number" name="proteines" value={form.proteines} onChange={handleChange} placeholder="30" min="0" />
                </div>
              </div>
              <div className="row2">
                <div className="fg">
                  <label>Glucides (g)</label>
                  <input type="number" name="glucides" value={form.glucides} onChange={handleChange} placeholder="60" min="0" />
                </div>
                <div className="fg">
                  <label>Lipides (g)</label>
                  <input type="number" name="lipides" value={form.lipides} onChange={handleChange} placeholder="15" min="0" />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleAddRepas} disabled={saving}>
                {saving ? '⏳...' : '✅ Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="overlay">
          <div className="modal">
            <h3>Supprimer ce repas ?</h3>
            <p style={{ color:'#9ca3af', margin:'.5rem 0 1.5rem' }}>Cette action est irréversible.</p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDeleteRepas(confirm)}>🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
