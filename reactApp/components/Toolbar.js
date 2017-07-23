import React from 'react';
import { RichUtils } from 'draft-js';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  bold() {
    const newState = RichUtils.toggleInlineStyle(this.props.editorState, 'BOLD');
    this.props.onChange(newState);
  }

  italic() {
    const newState = RichUtils.toggleInlineStyle(this.props.editorState, 'ITALIC');
    this.props.onChange(newState);
  }

  custom() {
    const newState = RichUtils.toggleInlineStyle(this.props.editorState, 'CUSTOM');
    this.props.onChange(newState);
  }

  render() {
    return (
        <div>
          <button onClick={() => this.bold()}>BOLD</button>
          <button onClick={() => this.italic()}>ITALICS</button>
          <button onClick={() => this.custom()}>CUSTOM</button>
        </div>
    );
  }
}

// https://draftjs.org/docs/advanced-topics-inline-styles.html#content
// https://draftjs.org/docs/api-reference-rich-utils.html#content

export default Toolbar;
