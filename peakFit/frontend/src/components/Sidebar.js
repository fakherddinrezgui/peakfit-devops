import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const SPORTS = [
  { type:'Course',   ico:'🏃', color:'#E60000' },
  { type:'Natation', ico:'🏊', color:'#4895EF' },
  { type:'Velo',     ico:'🚴', color:'#FF6B35' },
  { type:'Muscu',    ico:'💪', color:'#7209B7' },
  { type:'Yoga',     ico:'🧘', color:'#4CC9F0' },
];

const Sidebar = () => {
  const history  = useHistory();
  const location = useLocation();

  const goToSport = (type) => {
    sessionStorage.setItem('peakfit_filtre', type);
    if (location.pathname === '/activites') {
      // Déjà sur la page — déclencher un event custom
      window.dispatchEvent(new CustomEvent('peakfit_filtre', { detail: type }));
    } else {
      history.push('/activites');
    }
  };

  return (
    <div style={{
      position:'fixed', left:0, top:'var(--nav-h)', bottom:0,
      width:'var(--side-w)', background:'rgba(6,7,9,.9)',
      borderRight:'1px solid rgba(255,255,255,.06)',
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'1.2rem 0', gap:'.5rem', zIndex:50
    }}>
      {SPORTS.map(s => (
        <button
          key={s.type}
          onClick={() => goToSport(s.type)}
          title={s.type}
          style={{
            width:'44px', height:'44px', borderRadius:'12px',
            background:'var(--bg2)', border:'1px solid var(--border)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center',
            fontSize:'1.2rem', cursor:'pointer', transition:'all .2s',
            outline:'none', gap:'2px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${s.color}20`;
            e.currentTarget.style.borderColor = s.color;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg2)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>{s.ico}</span>
          <span style={{ fontSize:'.45rem', color:'var(--text3)', letterSpacing:'.5px', textTransform:'uppercase' }}>
            {s.type.slice(0,4)}
          </span>
        </button>
      ))}

      <div style={{flex:1}}/>
      <span style={{ fontSize:'.55rem', color:'var(--text4)', writingMode:'vertical-rl', letterSpacing:'1px' }}>
        PeakFit 2026
      </span>
    </div>
  );
};

export default Sidebar;
