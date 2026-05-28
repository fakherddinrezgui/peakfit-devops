import React from 'react';
const Confirm = ({msg,onConfirm,onClose,label='Supprimer'}) => (
  <div className="overlay" onClick={onClose}>
    <div className="modal" style={{maxWidth:'360px'}} onClick={e=>e.stopPropagation()}>
      <div className="confirm-box">
        <h3>Confirmer</h3>
        <p>{msg}</p>
        <div className="confirm-btns">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>🗑️ {label}</button>
        </div>
      </div>
    </div>
  </div>
);
export default Confirm;
