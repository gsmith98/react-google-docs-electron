import React from 'react';
import { Editor, EditorState } from 'draft-js';
import Toolbar from './Toolbar';

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
  }

  onChange(editorState) {
    this.setState({editorState});
  }

  render() {
    return (
      <div>
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
  }
}

export default MyEditor;
