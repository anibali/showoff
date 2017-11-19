import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import DocumentTitle from 'react-document-title';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';

import notebookActionCreators from '../../redux/notebooksActionCreators';
import Frame from '../Frame';
import BodyClass from '../BodyClass';


const styles = {
  bigSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
};

class Notebook extends React.Component {
  // Called during server-side rendering
  static preloadData(dispatch, match) {
    return Promise.all([
      notebookActionCreators.loadNotebook(match.params.id)(dispatch),
    ]);
  }

  componentWillMount() {
    if(!this.props.frames) {
      this.props.loadNotebook(this.props.id);
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
      children = (
        <div className={this.props.classes.bigSpinner}>
          <CircularProgress color="accent" size={150} />
        </div>
      );
    }

    return (
      <DocumentTitle title={this.props.title || 'Untitled notebook'}>
        <BodyClass className="notebook">
          <div className="fill-space">
            {children}
          </div>
        </BodyClass>
      </DocumentTitle>
    );
  }
}

export default withStyles(styles)(ReactRedux.connect(
  // Map store state to props
  (state, ownProps) => {
    const { id } = ownProps.match.params;
    const notebook = _.find(state.notebooks, { id }) || {};
    return { id, title: notebook.title, frames: notebook.frames };
  },
  (dispatch) => ({
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch),
    updateFrame: _.flow(notebookActionCreators.updateFrame, dispatch)
  })
)(Notebook));
