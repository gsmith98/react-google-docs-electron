import React from 'react';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  register(username, password, repeat) {
    fetch('http://localhost:3000/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        this.props.history.push('/');
      } else {
        this.setState({error: resp.error.errmsg})
      }
    })
    .catch(err => {throw err})
  }

  render() {
    let usernameField;
    let passwordField;
    let repeatPasswordField;
    return (
      <div>
        <h1>Register</h1>
        <p>{this.state.error}</p>
        <input ref={node => {usernameField=node}} placeholder="username" type="text" />
        <input ref={node => {passwordField=node}} placeholder="password" type="password" />
        <input ref={node => {repeatPasswordField=node}} placeholder="password" type="password" />
        <button
          onClick={() => this.register(
            usernameField.value,
            passwordField.value,
            repeatPasswordField.value)}
        >
          Register
        </button>
        <button onClick={() => this.props.history.push('/')}>Back to Login</button>
      </div>
    )
  }
}

export default Register
