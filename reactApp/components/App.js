import React from 'react';
import MyEditor from './MyEditor';
import DocumentsPortal from './DocumentsPortal';
import Login from './Login';
import Register from './Register';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { page: 'LOGIN' }
  }

  navigate(newPage) {
    this.setState({ page: newPage });
  }

  render() {
    switch(this.state.page) {
      case 'LOGIN':
        return <Login navigate={this.navigate.bind(this)} />
      case 'REGISTER':
        return <Register navigate={this.navigate.bind(this)} />
      case 'DOCPORTAL':
        return <DocumentsPortal navigate={this.navigate.bind(this)} />
      case 'EDITOR':
        return <MyEditor navigate={this.navigate.bind(this)} />
      default:
        return <p>Invalid page!</p>
    }
  }
}

export default App;
