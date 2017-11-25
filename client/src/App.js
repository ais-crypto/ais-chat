import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import Home from './components/Home.react';
import Login from './components/auth/Login.react';
import Protected from './components/Protected.react';

function onAuthRequired({ history }) {
  history.push('/login');
}

const config = {
  baseUrl: 'https://dev-894240.oktapreview.com/',
  redirectUri: window.location.origin + '/implicit/callback',
  clientId: '0oacycxjwzsnZ8CKp0h7'
};

class App extends Component {
  render() {
    console.log(config.redirectUri);
    return (
      <Router>
        <Security
          issuer={config.baseUrl + 'oauth2/default'}
          client_id={config.clientId}
          redirect_uri={config.redirectUri}
          onAuthRequired={onAuthRequired}
        >
          <Route path="/" exact={true} component={Home} />
          <SecureRoute path="/protected" component={Protected} />
          <Route
            path="/login"
            render={() => <Login baseUrl={config.baseUrl} />}
          />
          <Route path="/implicit/callback" component={ImplicitCallback} />
        </Security>
      </Router>
    );
  }
}

export default App;
