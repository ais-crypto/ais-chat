import React, { Component } from 'react';

const authOrigin =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

class Login extends Component {
  render() {
    return <a href={authOrigin + '/auth/google'}>Sign in with Google</a>;
  }
}

export default Login;
