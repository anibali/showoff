import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import DocumentTitle from 'react-document-title';
import { withContentRect } from 'react-measure';
import { withStyles } from 'material-ui/styles';
import { CircularProgress, LinearProgress } from 'material-ui/Progress';
import ErrorIcon from 'material-ui-icons/Error';
import Typography from 'material-ui/Typography';

import complexActionCreators from '../../../redux/complexActionCreators';
import simpleActionCreators from '../../../redux/simpleActionCreators';
import Frame from '../../Frame';
import BodyClass from '../../BodyClass';
import NotebookToolbar from './NotebookToolbar';
import { getNotebook } from '../../../redux/selectors/notebookSelectors';
import { getFrame, getNotebookFrames } from '../../../redux/selectors/frameSelectors';


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

const FrameWrapperPlain = (props) => {
  const { updateFrame, frame, containerWidth, containerHeight } = props;

  const onDimensionChange = (x, y, width, height, localOnly) => {
    const flatFrame = Object.assign({}, frame.attributes, { id: frame.id });
    updateFrame(_.assign({}, flatFrame, { x, y, width, height }), localOnly);
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

const FrameWrapper = ReactRedux.connect(
  null,
  (dispatch) => ({
    updateFrame: _.flow(complexActionCreators.updateFrame, dispatch),
  })
)(FrameWrapperPlain);

const Frames = withContentRect('bounds')(({ measureRef, contentRect, frames }) => {
  const createFrame = frame => (
    <FrameWrapper
      key={frame.id}
      frame={frame}
      containerWidth={contentRect.bounds.width}
      containerHeight={contentRect.bounds.height}
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
      this.props.arrangeFramesInGrid(this.props.notebook.id);
    };
  }

  // Called during server-side rendering
  static preloadData(dispatch, match) {
    return Promise.all([
      complexActionCreators.loadNotebook(match.params.id)(dispatch),
    ]);
  }

  componentWillMount() {
    const relFrames = _.get(this.props.notebook, ['relationships', 'frames', 'data'], []);
    if(relFrames.length === 0) {
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
    const { classes, notebook, frames } = this.props;
    const title = notebook ? notebook.attributes.title : 'Untitled notebook';

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
            <Frames frames={frames} />
            <LinearProgress mode="determinate" value={notebook.attributes.progress * 100} />
          </div>
        </BodyClass>
      </DocumentTitle>
    );
  }
}


export default withStyles(styles)(ReactRedux.connect(
  (state, ownProps) => {
    const { id } = ownProps.match.params;
    return { id, notebook: getNotebook(state, id), frames: getNotebookFrames(state, id) };
  },
  (dispatch) => ({
    loadNotebook: _.flow(complexActionCreators.loadNotebook, dispatch),
    arrangeFramesInGrid: _.flow(simpleActionCreators.entities.arrangeFramesInGrid, dispatch),
  })
)(Notebook));
