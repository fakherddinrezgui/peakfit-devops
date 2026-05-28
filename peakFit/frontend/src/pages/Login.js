import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO = [
  { n:'Yassine Ben Ali', e:'yassine@peakfit.com' },
  { n:'Mariem Trabelsi', e:'mariem@peakfit.com'  },
  { n:'Fares Bouazizi',  e:'fares@peakfit.com'   },
  { n:'Sarra Mansouri',  e:'sarra@peakfit.com'   },
];

const Login = () => {
  const { login, register } = useAuth();
  const history = useHistory();
  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ first_name:'', last_name:'', email:'', password:'', age:'' });
  const ch = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode==='login') await login(form.email, form.password);
      else await register({ ...form, age: parseInt(form.age)||25 });
      history.push('/');
    } catch(err) { setError(err.response?.data?.error || 'Email ou mot de passe incorrect.'); }
    finally { setLoading(false); }
  };
  const quickLogin = e => setForm(f => ({ ...f, email: e, password:'peakfit123' }));
  return (
    <div className="login-page">
      <div className="login-blob" style={{width:'380px',height:'380px',background:'#E60000',top:'-120px',left:'-80px'}}/>
      <div className="login-blob" style={{width:'280px',height:'280px',background:'#4895EF',bottom:'-80px',right:'-60px'}}/>
      <div className="login-card">
        <div className="login-logo"><span>PeakFit</span></div>
        <p className="login-tagline">Suivez. Analysez. Progressez.</p>
        <div className="login-tabs">
          <button className={mode==='login'?'on':''} onClick={()=>{setMode('login');setError('');}}>Se connecter</button>
          <button className={mode==='register'?'on':''} onClick={()=>{setMode('register');setError('');}}>Créer un compte</button>
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'.8rem'}}>
          {mode==='register' && (
            <div className="row2">
              <div className="fg"><label>Prénom *</label><input name="first_name" value={form.first_name} onChange={ch} placeholder="Yassine" required/></div>
              <div className="fg"><label>Nom *</label><input name="last_name" value={form.last_name} onChange={ch} placeholder="Ben Ali" required/></div>
            </div>
          )}
          {mode==='register' && <div className="fg"><label>Âge</label><input type="number" name="age" value={form.age} onChange={ch} placeholder="27" min="10" max="100"/></div>}
          <div className="fg"><label>Email *</label><input type="email" name="email" value={form.email} onChange={ch} placeholder="yassine@peakfit.com" required/></div>
          <div className="fg"><label>Mot de passe *</label><input type="password" name="password" value={form.password} onChange={ch} placeholder="••••••••" required minLength={6}/></div>
          {error && <div className="login-error">⚠️ {error}</div>}
          <button type="submit" className="login-submit" disabled={loading}>{loading?'⏳ Connexion...':mode==='login'?'Se connecter →':'Créer mon compte →'}</button>
        </form>
        {mode==='login' && (
          <div className="login-demo">
            <p>Comptes de démonstration — cliquer pour remplir :</p>
            <div style={{display:'flex',flexDirection:'column',gap:'.3rem',marginTop:'.4rem'}}>
              {DEMO.map(d => (
                <button key={d.e} onClick={()=>quickLogin(d.e)} style={{background:'var(--bg0)',border:'1px solid var(--border)',borderRadius:'6px',padding:'.3rem .7rem',color:'#7eb8f7',fontSize:'.75rem',cursor:'pointer',textAlign:'left'}}>
                  {d.n} — <span style={{opacity:.6}}>{d.e}</span>
                </button>
              ))}
            </div>
            <p style={{marginTop:'.5rem'}}>Mot de passe : <code>peakfit123</code></p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
