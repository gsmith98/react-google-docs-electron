import React from 'react';
import MyEditor from './MyEditor';
import DocumentsPortal from './DocumentsPortal';
import Login from './Login';
import Register from './Register';
import { Switch, Route } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/docportal" component={DocumentsPortal} />
          <Route path="/edit/:dochash" component={MyEditor} />
          <Route path='/' render={() => <p>Invalid Page!</p>} />
        </Switch>
      </div>
    )
  }
}

export default App;
