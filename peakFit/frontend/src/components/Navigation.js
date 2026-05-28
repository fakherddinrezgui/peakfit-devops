import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  {to:'/',label:'Accueil',ico:'🏠'},
  {to:'/activites',label:'Activités',ico:'🏃'},
  {to:'/performances',label:'Performances',ico:'📈'},
  {to:'/objectifs',label:'Objectifs',ico:'🎯'},
  {to:'/programmes',label:'Programmes',ico:'📋'},
  {to:'/recuperation',label:'Récupération',ico:'🧘'},
  {to:'/nutrition',label:'Nutrition',ico:'🍽️'},
  {to:'/communaute',label:'Communauté',ico:'👥'},
  {to:'/rapports',label:'Rapports',ico:'📊'},
];

const s = {
  nav: { position:'fixed',top:0,left:0,right:0,height:'var(--nav-h)',background:'rgba(6,7,9,.96)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',padding:'0 1.2rem',zIndex:100,gap:'.8rem' },
  logo: { display:'flex',alignItems:'center',flexShrink:0,textDecoration:'none' },
  logoText: { background:'#E60000',color:'#fff',fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1rem',padding:'.28rem .85rem',borderRadius:'8px',letterSpacing:'.5px' },
  navScroll: { display:'flex',gap:'.05rem',flex:1,overflowX:'auto',scrollbarWidth:'none' },
  link: { display:'flex',alignItems:'center',gap:'.3rem',padding:'.38rem .7rem',borderRadius:'8px',fontSize:'.8rem',fontWeight:500,color:'#525c74',whiteSpace:'nowrap',transition:'all .2s',textDecoration:'none' },
  linkActive: { color:'#f2f2f5',background:'rgba(255,255,255,.07)' },
  right: { display:'flex',alignItems:'center',gap:'.6rem',flexShrink:0 },
  notifBtn: { position:'relative',display:'flex',textDecoration:'none',padding:'.3rem' },
  badge: { position:'absolute',top:'-2px',right:'-2px',background:'#E60000',color:'#fff',borderRadius:'50%',width:'15px',height:'15px',fontSize:'.62rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' },
  avatar: { width:'30px',height:'30px',borderRadius:'50%',background:'#E60000',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.72rem',fontWeight:800,color:'#fff',textDecoration:'none' },
  username: { fontSize:'.8rem',color:'#9aa0b4',maxWidth:'70px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' },
  logoutBtn: { background:'transparent',border:'1px solid rgba(230,0,0,.25)',color:'#E60000',borderRadius:'5px',padding:'.18rem .45rem',fontSize:'.78rem',cursor:'pointer',transition:'all .2s' },
};

const Navigation = ({ notifCount=0 }) => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const ini = user ? `${user.first_name?.[0]||''}${user.last_name?.[0]||''}`.toUpperCase() : '?';
  return (
    <nav style={s.nav}>
      <NavLink exact to="/" style={s.logo}><span style={s.logoText}>PeakFit</span></NavLink>
      <div style={s.navScroll}>
        {NAV.map(({to,label,ico}) => (
          <NavLink key={to} exact={to==='/'} to={to} style={s.link} activeStyle={s.linkActive}>
            <span style={{fontSize:'.85rem'}}>{ico}</span>{label}
          </NavLink>
        ))}
      </div>
      <div style={s.right}>
        <NavLink to="/notifications" style={s.notifBtn}>
          <span style={{fontSize:'1rem'}}>🔔</span>
          {notifCount>0 && <span style={s.badge}>{notifCount>9?'9+':notifCount}</span>}
        </NavLink>
        {user && <>
          <NavLink to="/profil" style={s.avatar}>{ini}</NavLink>
          <span style={s.username}>{user.first_name}</span>
          <button style={s.logoutBtn} onClick={() => { logout(); history.push('/login'); }}>⎋</button>
        </>}
      </div>
    </nav>
  );
};
export default Navigation;
