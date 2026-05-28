import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import Sidebar    from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Profil = () => {
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const [tab,    setTab]    = useState('infos');
  const [form,   setForm]   = useState({ first_name:'', last_name:'', age:'', email:'' });
  const [pwForm, setPwForm] = useState({ current:'', nouveau:'', confirm:'' });
  const [stats,  setStats]  = useState({ total:{} });
  const [acts,   setActs]   = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ first_name:user.first_name||'', last_name:user.last_name||'', age:user.age||'', email:user.email||'' });
    api.getStats().then(setStats).catch(()=>{});
    api.getActivities().then(d=>setActs(d.sessions||[])).catch(()=>{});
  }, [user]);

  const ch  = e => setForm({...form,[e.target.name]:e.target.value});
  const chp = e => setPwForm({...pwForm,[e.target.name]:e.target.value});

  const saveProfil = async () => {
    setSaving(true);
    try {
      await axios.put(`${BASE}/api/auth/profile`, form);
      await refreshUser();
      toast.ok('Profil mis à jour ✅');
    } catch(e) { toast.err(e.response?.data?.error||'Erreur'); }
    setSaving(false);
  };

  const savePwd = async () => {
    if (pwForm.nouveau !== pwForm.confirm) return toast.err('Les mots de passe ne correspondent pas');
    if (pwForm.nouveau.length < 6) return toast.err('Mot de passe trop court (6 min)');
    setSaving(true);
    try {
      await axios.put(`${BASE}/api/auth/password`, { current:pwForm.current, nouveau:pwForm.nouveau });
      toast.ok('Mot de passe modifié ✅');
      setPwForm({ current:'', nouveau:'', confirm:'' });
    } catch(e) { toast.err(e.response?.data?.error||'Mot de passe actuel incorrect'); }
    setSaving(false);
  };

  const deleteAccount = () => {
    if (!window.confirm('Supprimer votre compte ? Cette action est irréversible.')) return;
    if (!window.confirm('Dernière confirmation ?')) return;
    logout();
  };

  const tot = stats.total || {};
  const favType = acts.reduce((acc,a) => { acc[a.type]=(acc[a.type]||0)+1; return acc; }, {});
  const fav = Object.entries(favType).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';
  const ini = user ? `${user.first_name?.[0]||''}${user.last_name?.[0]||''}`.toUpperCase() : '?';

  return (
    <div className="layout">
      <Navigation/>
      <Sidebar/>
      <main className="content-area">
        <div className="ph"><div><h1>Mon <strong>Profil</strong></h1><p>Gérez vos informations personnelles et la sécurité</p></div></div>

        {/* Header profil */}
        <div className="card" style={{marginBottom:'1.2rem'}}>
          <div className="profil-header">
            <div className="profil-avatar">{ini}</div>
            <div className="profil-identity">
              <h1>{user?.first_name} {user?.last_name}</h1>
              <p>{user?.email}</p>
              <p>Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR',{month:'long',year:'numeric'}) : '—'}</p>
              <div className="profil-kpis">
                <div className="profil-kpi"><div className="v">{tot.activites||0}</div><div className="l">Activités</div></div>
                <div className="profil-kpi"><div className="v">{tot.distanceKm||0}</div><div className="l">km total</div></div>
                <div className="profil-kpi"><div className="v">{Number(tot.calories||0).toLocaleString()}</div><div className="l">kcal</div></div>
                <div className="profil-kpi"><div className="v">{fav}</div><div className="l">Sport fav.</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profil-tabs">
          {[['infos','👤 Informations'],['securite','🔒 Sécurité'],['donnees','📊 Mes données']].map(([k,l])=>(
            <button key={k} className={`profil-tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>

        {/* Infos */}
        {tab==='infos' && (
          <div className="card">
            <h2>Informations personnelles</h2>
            <div className="row2" style={{marginBottom:'.85rem'}}>
              <div className="fg"><label>Prénom</label><input name="first_name" value={form.first_name} onChange={ch}/></div>
              <div className="fg"><label>Nom</label><input name="last_name" value={form.last_name} onChange={ch}/></div>
            </div>
            <div className="row2" style={{marginBottom:'1.2rem'}}>
              <div className="fg"><label>Âge</label><input type="number" name="age" value={form.age} onChange={ch} min="10" max="100"/></div>
              <div className="fg"><label>Email</label><input type="email" name="email" value={form.email} onChange={ch}/></div>
            </div>
            <button className="btn btn-primary" onClick={saveProfil} disabled={saving}>{saving?'⏳ Sauvegarde...':'💾 Sauvegarder'}</button>
          </div>
        )}

        {/* Sécurité */}
        {tab==='securite' && (
          <div className="card">
            <h2>Modifier le mot de passe</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'.85rem',marginBottom:'1.2rem'}}>
              <div className="fg"><label>Mot de passe actuel</label><input type="password" name="current" value={pwForm.current} onChange={chp} placeholder="••••••••"/></div>
              <div className="fg"><label>Nouveau mot de passe</label><input type="password" name="nouveau" value={pwForm.nouveau} onChange={chp} placeholder="6 caractères minimum"/></div>
              <div className="fg"><label>Confirmer</label><input type="password" name="confirm" value={pwForm.confirm} onChange={chp} placeholder="••••••••"/></div>
            </div>
            <button className="btn btn-primary" onClick={savePwd} disabled={saving}>🔒 Changer le mot de passe</button>
            <hr style={{borderColor:'var(--border)',margin:'2rem 0'}}/>
            <h2 style={{color:'var(--red)',marginBottom:'.5rem'}}>Zone dangereuse</h2>
            <p style={{color:'var(--text3)',fontSize:'.85rem',marginBottom:'1rem'}}>La suppression est irréversible. Toutes vos données seront perdues.</p>
            <button className="btn btn-danger" onClick={deleteAccount}>🗑️ Supprimer mon compte</button>
          </div>
        )}

        {/* Données */}
        {tab==='donnees' && (
          <div className="card">
            <h2>Vue d'ensemble de vos données</h2>
            <div style={{display:'flex',flexDirection:'column'}}>
              {[
                {ico:'🏃',l:'Activités enregistrées',v:acts.length},
                {ico:'📍',l:'Distance totale',        v:`${tot.distanceKm||0} km`},
                {ico:'🔥',l:'Calories brûlées',       v:`${Number(tot.calories||0).toLocaleString()} kcal`},
                {ico:'⏱️', l:"Heures d'activité",     v:`${tot.dureeH||0} h`},
                {ico:'💓',l:'FC moyenne',              v:`${tot.fcMoyenne||0} bpm`},
                {ico:'⭐',l:'Sport favori',            v:fav},
              ].map((d,i)=>(
                <div key={i} className="data-row">
                  <span className="data-ico">{d.ico}</span>
                  <span className="data-lbl">{d.l}</span>
                  <span className="data-val">{d.v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:'1.5rem',display:'flex',gap:'.8rem',flexWrap:'wrap'}}>
              <button className="btn btn-ghost" onClick={()=>window.location.href='/rapports'}>📊 Voir rapports</button>
              <button className="btn btn-ghost" onClick={logout}>⎋ Se déconnecter</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
export default Profil;
