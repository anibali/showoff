import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import DocumentTitle from 'react-document-title';
import { withContentRect } from 'react-measure';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import ErrorIcon from 'material-ui-icons/Error';
import Typography from 'material-ui/Typography';

import notebookActionCreators from '../../../redux/notebooksActionCreators';
import Frame from '../../Frame';
import BodyClass from '../../BodyClass';
import NotebookToolbar from './NotebookToolbar';


const styles = (theme) => ({
  centerStatus: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  errorIcon: {
    width: 150,
    height: 150,
    color: theme.palette.error.A400,
  },
  notebookContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
});

const FrameWrapper = (props) => {
  const { updateFrame, frame, containerWidth, containerHeight } = props;

  const onDimensionChange = (x, y, width, height, localOnly) => {
    updateFrame(_.assign({}, frame, { x, y, width, height }), localOnly);
  };

  return (
    <Frame
      frame={frame}
      containerWidth={containerWidth}
      containerHeight={containerHeight}
      onDimensionChange={onDimensionChange}
    />
  );
};

const Frames = withContentRect('bounds')(({ measureRef, contentRect, frames, updateFrame }) => {
  const createFrame = frame => (
    <FrameWrapper
      key={frame.id}
      frame={frame}
      containerWidth={contentRect.bounds.width}
      containerHeight={contentRect.bounds.height}
      updateFrame={updateFrame}
    />
  );

  return (
    <div className="flex1" ref={measureRef}>
      {frames.map(createFrame)}
    </div>
  );
});

class Notebook extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
    };

    this.arrangeFramesInGrid = () => {
      const frames = _.sortBy(this.props.frames, 'createdAt');
      const width = 460;
      const height = 320;
      frames.forEach((frame, i) => {
        const x = (i % 4) * width;
        const y = Math.floor(i / 4) * height;
        this.props.updateFrame(_.assign({}, frame, { x, y, width, height }), false);
      });
    };
  }

  // Called during server-side rendering
  static preloadData(dispatch, match) {
    return Promise.all([
      notebookActionCreators.loadNotebook(match.params.id)(dispatch),
    ]);
  }

  componentWillMount() {
    if(this.props.frames.length === 0) {
      this.setState({ loading: true });
      this.props.loadNotebook(this.props.id)
        .catch(err => {
          if(err.response && err.response.status === 404) {
            this.setState({ error: 'Not found' });
          } else {
            this.setState({ error: 'Something went wrong' });
          }
        })
        .then(() => this.setState({ loading: false }));
    }
  }

  // Describe how to render the component
  render() {
    const { classes, notebook } = this.props;
    const title = notebook ? notebook.attributes.title : 'Untitled notebook';

    const frames = _.values(this.props.frames)
      .map(entity => _.assign({}, entity.attributes, { id: entity.id }));

    if(this.state.error) {
      return (
        <DocumentTitle title={title}>
          <BodyClass className="notebook">
            <div className={classes.centerStatus}>
              <ErrorIcon className={classes.errorIcon} />
              <Typography type="headline" color="error" className={classes.statusText}>
                {this.state.error}
              </Typography>
            </div>
          </BodyClass>
        </DocumentTitle>
      );
    }
    if(this.state.loading) {
      return (
        <DocumentTitle title={title}>
          <BodyClass className="notebook">
            <div className={classes.centerStatus}>
              <CircularProgress color="accent" size={150} />
            </div>
          </BodyClass>
        </DocumentTitle>
      );
    }

    return (
      <DocumentTitle title={title}>
        <BodyClass className="notebook">
          <div className={classes.notebookContainer}>
            <NotebookToolbar
              onClickGrid={this.arrangeFramesInGrid}
            />
            <Frames
              frames={frames}
              updateFrame={this.props.updateFrame}
            />
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
    const notebook = state.entities.notebooks[id];
    const frames = _.filter(state.entities.frames,
      frame => frame.relationships.notebook.data.id === notebook.id);
    return { id, notebook, frames };
  },
  (dispatch) => ({
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch),
    updateFrame: _.flow(notebookActionCreators.updateFrame, dispatch)
  })
)(Notebook));
