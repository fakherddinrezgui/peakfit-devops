// ── constants.js ─────────────────────────────────────────────
export const ACT_COLORS = { Course:'#E60000', Velo:'#FF6B35', Natation:'#4895EF', Muscu:'#7209B7', Yoga:'#4CC9F0' };
export const ACT_ICONS  = { Course:'🏃', Velo:'🚴', Natation:'🏊', Muscu:'💪', Yoga:'🧘' };
export const ACT_TYPES  = ['Course','Velo','Natation','Muscu','Yoga'];
export const OBJ_COLORS = ['#E60000','#FF6B35','#4895EF','#7209B7','#4CC9F0','#22c55e','#f59e0b','#ec4899'];
export const INT_COLORS = { Faible:'#22c55e', Moderee:'#f59e0b', Elevee:'#E60000', Maximale:'#7209B7' };
export const NOTIF_COLORS = { objectif:'#E60000', entrainement:'#7209B7', hydratation:'#4895EF', recuperation:'#22c55e', badge:'#f59e0b', communaute:'#FF6B35' };
export const NOTIF_ICONS  = { objectif:'🎯', entrainement:'🏃', hydratation:'💧', recuperation:'🧘', badge:'🏅', communaute:'📢' };
export const SEV_COLORS   = { Legere:'#f59e0b', Moderee:'#E60000', Grave:'#7209B7' };
export const CONS_ICONS   = { etirement:'🧘', hydratation:'💧', sommeil:'😴', massage:'💆' };
export const REPAS_TYPES  = ['Petit-dejeuner','Dejeuner','Collation','Diner'];
export const REPAS_ICONS  = { 'Petit-dejeuner':'🌅','Dejeuner':'☀️','Collation':'🍎','Diner':'🌙' };

export const pct = (a, b) => b > 0 ? Math.min(Math.round((a/b)*100), 100) : 0;
export const trend = (a, b) => b > 0 ? Math.round(((a-b)/b)*100) : 0;
export const fmt = (d) => { try { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); } catch { return d||'—'; } };
export const fmtShort = (d) => { try { return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}); } catch { return d||'—'; } };
