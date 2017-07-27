import React from 'react';
import { Editor, EditorState, convertToRaw, convertFromRaw, RichUtils } from 'draft-js';
import Toolbar from './Toolbar';
import io from 'socket.io-client';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      title: 'Loading Document...',
      error: null
    };

    this.previousHighlight = null;

    this.socket = io('http://localhost:3000');

    this.socket.on('helloBack', ({doc}) => {
      console.log('you just joined', doc);
    });
    this.socket.on('userJoined', () => {
      console.log("user joined");
    });
    this.socket.on('userLeft', () => {
      console.log("user left");
    });
    this.socket.on("receiveNewContent", stringifiedContent => {
      const contentState = convertFromRaw(JSON.parse(stringifiedContent));
      const newEditorState = EditorState.createWithContent(contentState);
      this.setState({ editorState: newEditorState });
    });
    this.socket.on('receiveNewCursor', incomingSelectionObj => {
      console.log('inc', incomingSelectionObj);

      let editorState = this.state.editorState;
      const ogEditorState = editorState;
      const ogSelection = editorState.getSelection();

      const incomingSelectionState = ogSelection.merge(incomingSelectionObj);

      const temporaryEditorState = EditorState.forceSelection(ogEditorState, incomingSelectionState);

      this.setState({ editorState : temporaryEditorState}, () => {
        const winSel = window.getSelection();
        const range = winSel.getRangeAt(0);
        const rects = range.getClientRects()[0];
        console.log("range", range);
        console.log("rects", rects);
        const { top, left, bottom } = rects;
        this.setState({ editorState: ogEditorState, top, left, height: bottom - top});
      });



    });
    this.socket.emit('join', {doc: this.props.match.params.dochash});
  }

  onChange(editorState) {
    const selection = editorState.getSelection();

    if (this.previousHighlight) {
      editorState = EditorState.acceptSelection(editorState, this.previousHighlight);
      editorState = RichUtils.toggleInlineStyle(editorState, 'RED');
      editorState = EditorState.acceptSelection(editorState, selection);
      this.previousHighlight = null;
    }


    if (selection.getStartOffset() === selection.getEndOffset()) {
      console.log('selection', selection);
      this.socket.emit('cursorMove', selection);
    } else {
      editorState = RichUtils.toggleInlineStyle(editorState, 'RED');
      this.previousHighlight = editorState.getSelection();

    }

    const contentState = editorState.getCurrentContent();
    const stringifiedContent = JSON.stringify(convertToRaw(contentState));

    this.socket.emit('newContent', stringifiedContent);



    this.setState({editorState});
  }

  componentDidMount() {
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

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <div>
        {this.state.top && (
          <div
            style={{
              position: 'absolute',
              backgroundColor: 'red',
              width: '2px',
              height: this.state.height,
              top: this.state.top,
              left: this.state.left
            }}
          >
          </div>
        )}
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


const styleMap = {
  'CUSTOM': {
    textDecoration: 'line-through',
    color: 'red',
    float: 'right'
  },
  "RED": {
    backgroundColor: 'red'
  }
}

export default MyEditor;
