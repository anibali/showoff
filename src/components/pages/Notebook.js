import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import { withContentRect } from 'react-measure';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import ErrorIcon from 'material-ui-icons/Error';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpandLessIcon from 'material-ui-icons/ExpandLess';
import GridIcon from 'material-ui-icons/ViewModule';
import Typography from 'material-ui/Typography';

import notebookActionCreators from '../../redux/notebooksActionCreators';
import Frame from '../Frame';
import BodyClass from '../BodyClass';


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
});

class HideableAppBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidden: true,
    };

    this.show = () => {
      this.setState({ hidden: false });
    };

    this.hide = () => {
      this.setState({ hidden: true });
    };
  }

  render() {
    if(this.state.hidden) {
      return (
        <Toolbar style={{ zIndex: 9999, position: 'absolute', color: 'white', right: 0 }}>
          <Button fab color="primary" onClick={this.show} style={{ width: 48, height: 48 }}>
            <ExpandMoreIcon />
          </Button>
        </Toolbar>
      );
    }
    return (
      <AppBar position="static">
        <Toolbar>
          <Button color="contrast" to="/" component={Link}>Home</Button>
          <IconButton color="contrast" onClick={this.props.onClickGrid}>
            <GridIcon />
          </IconButton>
          <div style={{ flex: 1 }} />
          <IconButton color="contrast" onClick={this.hide}>
            <ExpandLessIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

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
    <div style={{ flex: 1 }} ref={measureRef}>
      {frames.map(createFrame)}
    </div>
  );
});

class Notebook extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    if(!this.props.frames) {
      this.props.loadNotebook(this.props.id).catch(err => {
        if(err.response && err.response.status === 404) {
          this.setState({ error: 'Not found' });
        } else {
          this.setState({ error: 'Something went wrong' });
        }
      });
    }
  }

  // Describe how to render the component
  render() {
    if(this.state.error) {
      return (
        <DocumentTitle title={this.props.title || 'Untitled notebook'}>
          <BodyClass className="notebook">
            <div className={this.props.classes.centerStatus}>
              <ErrorIcon className={this.props.classes.errorIcon} />
              <Typography type="headline" color="error" className={this.props.classes.statusText}>
                {this.state.error}
              </Typography>
            </div>
          </BodyClass>
        </DocumentTitle>
      );
    }
    if(!this.props.frames) {
      return (
        <DocumentTitle title={this.props.title || 'Untitled notebook'}>
          <BodyClass className="notebook">
            <div className={this.props.classes.centerStatus}>
              <CircularProgress color="accent" size={150} />
            </div>
          </BodyClass>
        </DocumentTitle>
      );
    }

    return (
      <DocumentTitle title={this.props.title || 'Untitled notebook'}>
        <BodyClass className="notebook">
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <HideableAppBar
              onClickGrid={this.arrangeFramesInGrid}
            />
            <Frames
              frames={this.props.frames}
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
    const notebook = _.find(state.notebooks, { id }) || {};
    return { id, title: notebook.title, frames: notebook.frames };
  },
  (dispatch) => ({
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch),
    updateFrame: _.flow(notebookActionCreators.updateFrame, dispatch)
  })
)(Notebook));
