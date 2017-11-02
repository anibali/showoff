import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import DocumentTitle from 'react-document-title';
import notebookActionCreators from '../redux/notebooksActionCreators';
import reactAsync from '../helpers/reactAsync';
import Frame from './Frame';

class Notebook extends React.Component {
  componentWillMount() {
    if(!this.props.frames) {
      reactAsync.addPromise(this.props.loadNotebook(this.props.id));
    }
  }

  // Describe how to render the component
  render() {
    const onFrameDimensionChange = (frame, x, y, width, height) => {
      this.props.updateFrame(_.assign({}, frame, { x, y, width, height }));
    };

    let children = null;
    if(this.props.frames) {
      const createFrame = frame => (
        <Frame
          key={frame.id}
          frame={frame}
          initialX={frame.x}
          initialY={frame.y}
          initialWidth={frame.width}
          initialHeight={frame.height}
          onDimensionChange={_.partial(onFrameDimensionChange, frame)}
        />
      );

      children = this.props.frames.map(createFrame);
    } else {
      const style = {
        color: 'white', fontSize: 128,
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)'
      };
      children = (
        <div style={style}>
          <span className="fa fa-spinner fa-pulse" />
        </div>
      );
    }

    return (
      <DocumentTitle title={this.props.title || 'Untitled notebook'}>
        <div className="fill-space notebook">
          {children}
        </div>
      </DocumentTitle>
    );
  }
}

export default ReactRedux.connect(
  // Map store state to props
  (state, ownProps) => {
    const id = parseInt(ownProps.params.id, 10);
    const notebook = _.find(state.notebooks, { id }) || {};
    return { id, title: notebook.title, frames: notebook.frames };
  },
  (dispatch) => ({
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch),
    updateFrame: _.flow(notebookActionCreators.updateFrame, dispatch)
  })
)(Notebook);
