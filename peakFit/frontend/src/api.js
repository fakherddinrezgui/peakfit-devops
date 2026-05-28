import axios from 'axios';
const B = process.env.REACT_APP_API_URL || 'http://localhost:8091';
const g = url => axios.get(`${B}${url}`).then(r=>r.data);
const p = (url,d) => axios.post(`${B}${url}`,d).then(r=>r.data);
const u = (url,d) => axios.put(`${B}${url}`,d).then(r=>r.data);
const d = url => axios.delete(`${B}${url}`).then(r=>r.data);

const api = {
  // Auth
  me: () => g('/api/auth/me'),
  updateProfile: data => u('/api/auth/profile', data),
  changePassword: data => u('/api/auth/password', data),
  // Stats dashboard
  getStats:    () => g('/api/stats'),
  getMonthly:  () => g('/api/stats').then(r=>r.monthly||[]),
  getPerf:     () => g('/api/stats').then(r=>({data:r.performance||[]})),
  getAvg:      () => g('/api/stats').then(r=>({sessions:r.averageSession||[]})),
  // Activités
  getActivities:    () => g('/api/activities'),
  createActivity:   data => p('/api/activities', data),
  updateActivity:   (id,data) => u(`/api/activities/${id}`, data),
  deleteActivity:   id => d(`/api/activities/${id}`),
  // Objectifs
  getObjectifs:    () => g('/api/objectifs'),
  createObjectif:  data => p('/api/objectifs', data),
  updateObjectif:  (id,data) => u(`/api/objectifs/${id}`, data),
  deleteObjectif:  id => d(`/api/objectifs/${id}`),
  // Programmes
  getProgrammes:   () => g('/api/programmes'),
  createProgramme: data => p('/api/programmes', data),
  toggleSeance:    (id,fait) => u(`/api/programmes/seance/${id}`, {fait}),
  // Récupération
  getRecuperation: () => g('/api/recuperation'),
  createBlessure:  data => p('/api/recuperation/blessure', data),
  updateBlessure:  (id,data) => u(`/api/recuperation/blessure/${id}`, data),
  doneConseil:     id => u(`/api/recuperation/conseil/${id}`),
  // Nutrition
  getNutrition:    () => g('/api/nutrition'),
  addRepas:        data => p('/api/nutrition/repas', data),
  deleteRepas:     id => d(`/api/nutrition/repas/${id}`),
  addHydratation:  ml => p('/api/nutrition/hydratation', {ml}),
  // Communauté
  getCommunaute:   () => g('/api/communaute'),
  // Notifications
  getNotifications: () => g('/api/notifications'),
  markRead:         id => u(`/api/notifications/${id}/lire`),
  markAllRead:      () => u('/api/notifications/lire-tout'),
};
export default api;
