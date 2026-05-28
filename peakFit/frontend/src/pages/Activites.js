/**
 * BF01 — Suivi des Activités Sportives — CRUD complet
 */
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
         ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navigation from '../components/Navigation';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { ACTIVITY_COLORS, ACTIVITY_TYPES } from '../utils/constants';
import { useToast } from '../context/ToastContext';

const COLORS = { Course:'#E60000', Velo:'#FF6B35', Natation:'#4895EF', Muscu:'#7209B7', Yoga:'#4CC9F0' };
const TYPES  = ['Course','Velo','Natation','Muscu','Yoga'];

const EMPTY = { day:'', type:'Course', kilogram:'', calories:'', distance_km:'', duree_min:'', vitesse_moy:'', freq_card_moy:'' };

/* ── Modal Formulaire ── */
const Modal = ({ title, form, onChange, onSave, onClose, saving }) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-head">
        <h3>{title}</h3>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="row2">
          <div className="fg">
            <label>Date *</label>
            <input type="date" name="day" value={form.day} onChange={onChange} required />
          </div>
          <div className="fg">
            <label>Type *</label>
            <select name="type" value={form.type} onChange={onChange}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="row2">
          <div className="fg">
            <label>Durée (min) *</label>
            <input type="number" name="duree_min" value={form.duree_min} onChange={onChange} placeholder="45" min="1" required />
          </div>
          <div className="fg">
            <label>Calories (kcal)</label>
            <input type="number" name="calories" value={form.calories} onChange={onChange} placeholder="400" min="0" />
          </div>
        </div>
        <div className="row2">
          <div className="fg">
            <label>Poids (kg)</label>
            <input type="number" name="kilogram" value={form.kilogram} onChange={onChange} placeholder="70.5" step="0.1" />
          </div>
          <div className="fg">
            <label>Distance (km)</label>
            <input type="number" name="distance_km" value={form.distance_km} onChange={onChange} placeholder="6.2" step="0.1" />
          </div>
        </div>
        <div className="row2">
          <div className="fg">
            <label>Vitesse moy. (km/h)</label>
            <input type="number" name="vitesse_moy" value={form.vitesse_moy} onChange={onChange} placeholder="8.5" step="0.1" />
          </div>
          <div className="fg">
            <label>Fréquence cardiaque (bpm)</label>
            <input type="number" name="freq_card_moy" value={form.freq_card_moy} onChange={onChange} placeholder="150" />
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>
          {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
        </button>
      </div>
    </div>
  </div>
);

const Activites = () => {
  const [activity, setActivity] = useState({ sessions: [], types: [] });
  const [filtre, setFiltre]     = useState('Tous');
  const [modal, setModal]       = useState(false);   // false | 'add' | 'edit'
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);    // id à supprimer

  const load = () => api.getActivities().then(setActivity);
  useEffect(() => {
    load();
    const saved = sessionStorage.getItem("peakfit_filtre");
    if (saved) { setFiltre(saved); sessionStorage.removeItem("peakfit_filtre"); }
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd  = () => { setForm({ ...EMPTY, day: new Date().toISOString().slice(0,10) }); setEditId(null); setModal('add'); };
  const openEdit = s => {
    setForm({ day: s.day, type: s.type, kilogram: s.kilogram, calories: s.calories,
              distance_km: s.distanceKm, duree_min: s.dureeMin, vitesse_moy: s.vitesseMoy, freq_card_moy: s.freqCardMoy });
    setEditId(s.id); setModal('edit');
  };

  const handleSave = async () => {
    if (!form.day || !form.duree_min) return alert('Date et durée obligatoires !');
    setSaving(true);
    try {
      if (modal === 'add') await api.createActivity(form);
      else await api.updateActivity(editId, form);
      await load(); setModal(false);
    } catch (e) { alert('Erreur : ' + (e.response?.data?.error || e.message)); }
    setSaving(false);
  };

  const handleDelete = async id => {
    try { await api.deleteActivity(id); await load(); } catch (e) { alert('Erreur suppression'); }
    setConfirm(null);
  };

  const typesList        = ['Tous', ...new Set(activity.sessions.map(s => s.type))];
  const sessionsFiltrees = filtre === 'Tous' ? activity.sessions : activity.sessions.filter(s => s.type === filtre);
  const types            = activity.types || [];

  return (
    <div className="layout">
      <Navigation />
      <Sidebar />
      <div className="content-area">

        {/* Header */}
        <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1>Suivi des <strong>Activités</strong></h1>
            <p>Historique et métriques de vos séances sportives</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Ajouter une activité</button>
        </div>

        {/* Filtres */}
        <div className="filters">
          {typesList.map(t => (
            <button key={t} className={`pill ${filtre === t ? 'active' : ''}`} onClick={() => setFiltre(t)}>{t}</button>
          ))}
        </div>

        {/* Message vide */}
        {activity.sessions.length === 0 && (
          <div className="empty">
            <p>🏃 Aucune activité enregistrée.</p>
            <button className="btn btn-primary" onClick={openAdd}>Ajouter ma première activité</button>
          </div>
        )}

        {/* Graphique */}
        {sessionsFiltrees.length > 0 && (
          <div className="card card-large">
            <h2>Activité quotidienne — Calories et Poids</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sessionsFiltrees} margin={{ top:10, right:30, left:0, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="index" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left"  orientation="left"  tickLine={false} axisLine={false} domain={['dataMin - 5','dataMax + 5']} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} domain={[0,'dataMax + 100']} />
                <Tooltip />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                <Bar yAxisId="left"  name="Poids (kg)"      dataKey="kilogram" fill="#282D30" barSize={7} radius={3} />
                <Bar yAxisId="right" name="Calories (kcal)" dataKey="calories" fill="#E60000" barSize={7} radius={3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Répartition pie */}
        {types.length > 0 && (
          <div className="grid2">
            <div className="card">
              <h2>Répartition par type</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={types} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}
                       label={({ type, percent }) => `${type} ${(percent*100).toFixed(0)}%`}>
                    {types.map((t,i) => <Cell key={i} fill={t.couleur || COLORS[t.type] || '#888'} />)}
                  </Pie>
                  <Tooltip formatter={(v,n) => [`${v} séances`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h2>Récap par activité</h2>
              <table className="tbl">
                <thead><tr><th>Activité</th><th>Séances</th><th>Calories</th><th>Distance</th></tr></thead>
                <tbody>
                  {types.map(t => (
                    <tr key={t.type}>
                      <td><span className="dot" style={{ background: t.couleur || COLORS[t.type] }}></span>{t.type}</td>
                      <td>{t.count}</td>
                      <td>{(t.calories||0).toLocaleString()} kcal</td>
                      <td>{t.distanceKm > 0 ? `${t.distanceKm} km` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tableau historique */}
        {sessionsFiltrees.length > 0 && (
          <div className="card">
            <h2>Historique des séances</h2>
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Durée</th><th>Distance</th><th>Calories</th><th>Vitesse</th><th>FC</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {[...sessionsFiltrees].reverse().map(s => (
                  <tr key={s.id || s.index}>
                    <td>{s.day}</td>
                    <td><span className="badge-type" style={{ background: COLORS[s.type]||'#888' }}>{s.type}</span></td>
                    <td>{s.dureeMin} min</td>
                    <td>{s.distanceKm > 0 ? `${s.distanceKm} km` : '—'}</td>
                    <td>{s.calories} kcal</td>
                    <td>{s.vitesseMoy > 0 ? `${s.vitesseMoy} km/h` : '—'}</td>
                    <td>{s.freqCardMoy > 0 ? `${s.freqCardMoy} bpm` : '—'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon edit"   onClick={() => openEdit(s)} title="Modifier">✏️</button>
                      <button className="btn-icon delete" onClick={() => setConfirm(s.id)} title="Supprimer">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ajout / Édition */}
      {modal && <Modal title={modal === 'add' ? 'Nouvelle activité' : 'Modifier l\'activité'}
        form={form} onChange={handleChange} onSave={handleSave} onClose={() => setModal(false)} saving={saving} />}

      {/* Confirmation suppression */}
      {confirm && (
        <div className="overlay">
          <div className="modal">
            <h3>Supprimer cette activité ?</h3>
            <p style={{ color:'#9ca3af', margin:'.5rem 0 1.5rem' }}>Cette action est irréversible.</p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirm)}>🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activites;
