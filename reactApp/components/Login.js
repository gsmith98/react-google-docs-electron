import React from 'react';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  login(username, password) {
    console.log(username, password);
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(resp => resp.status === 401 ? resp.text() : resp.json())
    .then(result => {
      if (result === 'Unauthorized') {
        this.setState({error: 'Incorrect Username or Password'});
      } else {
        this.props.navigate('DOCPORTAL');
      }
    })
    .catch(err => {throw err})
  }

  render() {
    let usernameField;
    let passwordField;
    return (
      <div>
        <h1>Login</h1>
        <p>{this.state.error}</p>
        <input ref={node => {usernameField=node}} placeholder="username" type="text" />
        <input ref={node => {passwordField=node}} placeholder="password" type="password" />
        <button onClick={() => this.login(usernameField.value, passwordField.value)}>Login</button>
        <button onClick={() => this.props.navigate('REGISTER')}>Register</button>
      </div>
    )
  }
}

export default Login
