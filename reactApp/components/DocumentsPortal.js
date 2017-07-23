import React from 'react';

class DocumentsPortal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { userDocs: [] };
  }

  componentDidMount() {
    // fetch user's docs
  }

  newDoc(title) {
    // make doc and navigate to it
  }

  render() {
    let newDocTitleField;
    return (
      <div>
        <h1>Documents Portal</h1>
        <input
          ref={node => {newDocTitleField = node}}
          placeholder="new document title"
        />
        <button onClick={() => this.newDoc(newDocTitleField.value)}>Create Document</button>
        <ul>{this.state.userDocs.map(doc => <li>{doc.title}</li>)}</ul>
      </div>
    )
  }
}

export default DocumentsPortal
