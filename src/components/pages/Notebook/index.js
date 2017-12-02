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
import { createSelector } from '../../../helpers/select';


const getFrame = createSelector(
  [
    ({ state, id }) => state.entities.frames[id],
  ],
  (frame) => _.assign({}, frame.attributes, { id: frame.id })
);

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

const FrameWrapper = ReactRedux.connect(
  (state, ownProps) => ({
    frame: getFrame({ state, id: ownProps.frameId }),
  }),
  (dispatch) => ({
    updateFrame: _.flow(notebookActionCreators.updateFrame, dispatch),
  })
)(FrameWrapperPlain);

const Frames = withContentRect('bounds')(({ measureRef, contentRect, frameIds }) => {
  const createFrame = frameId => (
    <FrameWrapper
      key={frameId}
      frameId={frameId}
      containerWidth={contentRect.bounds.width}
      containerHeight={contentRect.bounds.height}
    />
  );

  return (
    <div className="flex1" ref={measureRef}>
      {frameIds.map(createFrame)}
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
      console.log('TODO: Arrange frames in grid pattern');
      // const frames = _.sortBy(this.props.frames, 'createdAt');
      // const width = 460;
      // const height = 320;
      // frames.forEach((frame, i) => {
      //   const x = (i % 4) * width;
      //   const y = Math.floor(i / 4) * height;
      //   this.props.updateFrame(
      //     _.assign({}, frame.attributes, { id: frame.id }, { x, y, width, height }));
      // });
    };
  }

  // Called during server-side rendering
  static preloadData(dispatch, match) {
    return Promise.all([
      notebookActionCreators.loadNotebook(match.params.id)(dispatch),
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
    const { classes, notebook } = this.props;
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

    const frameIds = notebook.relationships.frames.data.map(frame => frame.id);

    return (
      <DocumentTitle title={title}>
        <BodyClass className="notebook">
          <div className={classes.notebookContainer}>
            <NotebookToolbar
              onClickGrid={this.arrangeFramesInGrid}
            />
            <Frames frameIds={frameIds} />
          </div>
        </BodyClass>
      </DocumentTitle>
    );
  }
}

export default withStyles(styles)(ReactRedux.connect(
  (state, ownProps) => {
    const { id } = ownProps.match.params;
    const notebook = state.entities.notebooks[id];
    return { id, notebook };
  },
  (dispatch) => ({
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch),
  })
)(Notebook));
