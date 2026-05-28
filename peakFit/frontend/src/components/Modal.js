import React from 'react';
const Modal = ({title,onClose,onSave,saving,saveLabel='Sauvegarder',children,size='md'}) => (
  <div className="overlay" onClick={onClose}>
    <div className={`modal ${size==='lg'?'lg':''}`} onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button className="modal-close" onClick={onClose}>✕</button></div>
      <div className="modal-body">{children}</div>
      <div className="modal-foot">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
        {onSave && <button className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>{saving?'⏳ ...':'✅ '+saveLabel}</button>}
      </div>
    </div>
  </div>
);
export default Modal;
