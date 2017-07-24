import React from 'react';

class DocumentsPortal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userDocs: [], error: null };
  }

  componentDidMount() {
    this.loadDocs();
  }

  loadDocs() {
    fetch('http://localhost:3000/getUserDocuments', {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        this.setState({ userDocs: resp.userDocs, error: null });
      } else {
        this.setState({ error: resp.error.errmsg})
      }
    })
    .catch(err => { throw err });
  }

  newDoc(title) {
    fetch('http://localhost:3000/newdocument', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        this.setState({ userDocs: this.state.userDocs.concat(resp.newDoc), error: null });
      } else {
        this.setState({ error: resp.error.errmsg})
      }
    })
    .catch(err => { throw err });
  }

  render() {
    let newDocTitleField;
    return (
      <div>
        <h1>Documents Portal</h1>
        <p>{this.state.error}</p>
        <input
          ref={node => {newDocTitleField = node}}
          placeholder="new document title"
        />
        <button onClick={() => {
          this.newDoc(newDocTitleField.value);
          newDocTitleField.value = '';
        }}>Create Document</button>
        <div style={{outline: 'solid', padding: 10, margin: 10}}>
          <label>My Documents</label>
          <ul>{this.state.userDocs.map(doc => <li key={doc._id}>{doc.title}</li>)}</ul>
        </div>
      </div>
    )
  }
}

export default DocumentsPortal
