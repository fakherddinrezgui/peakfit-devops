import './style/main.scss';
import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login         from './pages/Login';
import Home          from './pages/Home';
import Activites     from './pages/Activites';
import Performances  from './pages/Performances';
import Objectifs     from './pages/Objectifs';
import Programmes    from './pages/Programmes';
import Recuperation  from './pages/Recuperation';
import Nutrition     from './pages/Nutrition';
import Communaute    from './pages/Communaute';
import Notifications from './pages/Notifications';
import Rapports      from './pages/Rapports';
import Profil        from './pages/Profil';
import NotFound      from './pages/NotFound';

const Spin = () => (
  <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#060709'}}>
    <div style={{width:'34px',height:'34px',border:'3px solid #E60000',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
  </div>
);

const Guard = ({ component: C, ...rest }) => {
  const { user } = useAuth();
  return <Route {...rest} render={p => user ? <C {...p}/> : <Redirect to="/login"/>}/>;
};

const Routes = () => {
  const { user } = useAuth();
  return (
    <Switch>
      <Route exact path="/login" render={() => user ? <Redirect to="/"/> : <Login/>}/>
      <Guard exact path="/"              component={Home}/>
      <Guard exact path="/activites"     component={Activites}/>
      <Guard exact path="/performances"  component={Performances}/>
      <Guard exact path="/objectifs"     component={Objectifs}/>
      <Guard exact path="/programmes"    component={Programmes}/>
      <Guard exact path="/recuperation"  component={Recuperation}/>
      <Guard exact path="/nutrition"     component={Nutrition}/>
      <Guard exact path="/communaute"    component={Communaute}/>
      <Guard exact path="/notifications" component={Notifications}/>
      <Guard exact path="/rapports"      component={Rapports}/>
      <Guard exact path="/profil"        component={Profil}/>
      <Route component={NotFound}/>
    </Switch>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes/>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
