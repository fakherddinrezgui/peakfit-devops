import React from 'react';
import { useHistory } from 'react-router-dom';
const NotFound = () => {
  const h = useHistory();
  return (
    <div style={{minHeight:'100vh',background:'var(--bg0)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.5rem',textAlign:'center',padding:'2rem'}}>
      <div style={{fontSize:'4rem'}}>🏃</div>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'5rem',fontWeight:900,color:'var(--red)',lineHeight:1}}>404</h1>
      <div>
        <h2 style={{fontSize:'1.3rem',color:'var(--text1)',marginBottom:'.5rem'}}>Page introuvable</h2>
        <p style={{color:'var(--text3)',maxWidth:'320px'}}>Cette page n'existe pas. Retournez à l'accueil pour continuer votre entraînement.</p>
      </div>
      <div style={{display:'flex',gap:'.8rem',flexWrap:'wrap',justifyContent:'center'}}>
        <button className="btn btn-primary" onClick={()=>h.push('/')}>🏠 Accueil</button>
        <button className="btn btn-ghost"   onClick={()=>h.goBack()}>← Retour</button>
      </div>
    </div>
  );
};
export default NotFound;
