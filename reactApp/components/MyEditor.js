import React from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw, RichUtils } from 'draft-js';
const io = require('socket.io-client');
import Toolbar from './Toolbar';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      title: 'Loading Document...',
      error: null
    };

    this.previousHighlight = null;
    this.highlightStyle = null;

    this.socket = io('http://localhost:3000');
    this.socket.on('connectionReady', () => {
      this.socket.emit('join', {docId: this.props.match.params.dochash})
    });
    this.socket.on('userJoined', color => {
      console.log('user joined', color);
    });
    this.socket.on('newColor', color => {
      console.log('color', color);
      this.highlightStyle = color;
    });
    this.socket.on('contentUpdate', newContent => {
      const raw = JSON.parse(newContent);
      const contentState = convertFromRaw(raw);

      this.setState({
          editorState: EditorState.createWithContent(contentState)
      });

    });
  }

  onChange(editorState) {
    const selection = editorState.getSelection();

    // remove styling from previous highlight
    if (this.previousHighlight) {
      editorState = EditorState.acceptSelection(editorState, this.previousHighlight);
      editorState = RichUtils.toggleInlineStyle(editorState, this.highlightStyle);
      editorState = EditorState.acceptSelection(editorState, selection);

      this.previousHighlight = null;
    }

    // if this is a highlight, style it
    if (selection.getStartOffset() !== selection.getEndOffset()) {
      editorState = RichUtils.toggleInlineStyle(editorState, this.highlightStyle);
      this.previousHighlight = selection;
    }





    this.setState({editorState});

    const content = editorState.getCurrentContent();
    const raw = convertToRaw(content);
    const jsonRaw = JSON.stringify(raw);
    this.socket.emit('contentUpdate', jsonRaw);
  }

  componentDidMount() {
    // load document content and title (owner ? register with names?)

    const docId = this.props.match.params.dochash;

    fetch(`http://localhost:3000/getdocument/${docId}`, {
      credentials: 'include'
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        const raw = resp.document.content;

        if (raw) {
          const contentState = convertFromRaw(JSON.parse(raw));
          this.setState({
            editorState: EditorState.createWithContent(contentState),
            title: resp.document.title
          });
        } else {
          this.setState({
            title: resp.document.title
          });
        }

      } else {
        this.setState({ error: resp.error.errmsg});
      }
    })
    .catch(err => { throw err });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  saveDocument() {
    const contentState = this.state.editorState.getCurrentContent();
    const stringifiedContent = JSON.stringify(convertToRaw(contentState));
    const docId = this.props.match.params.dochash;


    fetch(`http://localhost:3000/savedocument/${docId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: stringifiedContent })
    })
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        // successful save
      } else {
        throw resp.error;
      }
    })
    .catch(err => { throw err });
  }

  render() {
    return (
      <div>
        <button onClick={() => this.props.history.push('/docportal')}>{'<'} Back to Documents Portal</button>
        <h1>{this.state.title}</h1>
        <div style={{margin: 10}}>
          <label>Shareable Document ID: </label><span>{this.props.match.params.dochash}</span>
        </div>
        <div>
          <button onClick={() => this.saveDocument()}>Save Changes</button>
        </div>
        <p>{this.state.error}</p>

        <Toolbar editorState={this.state.editorState} onChange={this.onChange.bind(this)}/>
        <div style={{outline: 'solid'}}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange.bind(this)}
            customStyleMap={styleMap}
          />
        </div>
      </div>

    );
  }
}

// https://draftjs.org/docs/advanced-topics-inline-styles.html#content
// https://draftjs.org/docs/api-reference-rich-utils.html#content
const styleMap = {
  'CUSTOM': {
    textDecoration: 'line-through',
    color: 'red',
    float: 'right'
  },
  'HIGHLIGHT1': {
    backgroundColor: 'red'
  },
  'HIGHLIGHT2': {
    backgroundColor: 'yellow'
  },
  'HIGHLIGHT3': {
    backgroundColor: 'green'
  },
  'HIGHLIGHT4': {
    backgroundColor: 'blue'
  }
}

export default MyEditor;
