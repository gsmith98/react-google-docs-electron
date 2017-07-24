import React from 'react';
import { Link } from 'react-router-dom';

class DocumentsPortal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userDocs: [], error: null };
  }

  componentDidMount() {
    this.loadDocs();
  }

  loadDocs() {
    fetch('http://localhost:3000/getuserdocuments', {
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

  addSharedDoc(docId) {
    let docToAdd;
    fetch(`http://localhost:3000/getdocument/${docId}`, {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if (!resp.success) throw resp.error;

      docToAdd = resp.document;

      return fetch(`http://localhost:3000/addshareddoc/${docId}`, {
        credentials: 'include'
      });
    })
    .then(resp => resp.json())
    .then(resp => {
      if (!resp.success) throw resp.error;

      this.setState({ userDocs: this.state.userDocs.concat(docToAdd), error: null });
    })
    .catch(err => { this.setState({error: err.errmsg}) });
  }


  render() {
    let newDocTitleField;
    let shareIdField;
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
          <div>
            {this.state.userDocs.map(doc => <div key={doc._id}><Link to={`/edit/${doc._id}`}>{doc.title}</Link></div>)}
          </div>
        </div>
        <div>
          <input
            ref={node => {shareIdField = node}}
            placeholder="paste a doc id shared with you here"
          />
          <button onClick={() => {
            this.addSharedDoc(shareIdField.value);
            shareIdField.value = '';
          }}>Add Shared Document</button>
        </div>
      </div>
    )
  }
}

export default DocumentsPortal
