import React from 'react';

class Register extends React.Component {
  register(username, password, repeat) {
    console.log(username, password, repeat);

    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => {throw err})
  }

  render() {
    let usernameField;
    let passwordField;
    let repeatPasswordField;
    return (
      <div>
        <h1>Register</h1>
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
        <button onClick={() => this.props.navigate('LOGIN')}>Back to Login</button>
      </div>
    )
  }
}

export default Register
