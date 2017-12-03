import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Home from './components/Home';
import Chat from './components/Chat';

class App extends Component {
  render() {
    return (
      <div
        style={{ backgroundColor: 'rgb(48,48,48)', height: window.innerHeight }}
      >
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <Router>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/:chatname" component={Chat} />
            </Switch>
          </Router>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
