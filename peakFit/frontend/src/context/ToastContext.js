import React, { createContext, useContext, useState, useCallback } from 'react';
const Ctx = createContext(null);
export const ToastProvider = ({ children }) => {
  const [toasts, set] = useState([]);
  const add = useCallback((msg, type='ok', ms=3000) => {
    const id = Date.now()+Math.random();
    set(t => [...t, {id,msg,type}]);
    setTimeout(() => set(t => t.filter(x => x.id!==id)), ms);
  }, []);
  const ok  = useCallback(m => add(m,'ok'),  [add]);
  const err = useCallback(m => add(m,'err',4000), [add]);
  const inf = useCallback(m => add(m,'inf'), [add]);
  return (
    <Ctx.Provider value={{ok,err,inf}}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type==='ok'?'✅':t.type==='err'?'❌':'ℹ️'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};
export const useToast = () => useContext(Ctx);
