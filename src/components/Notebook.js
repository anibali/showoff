const _ = require('lodash');
const React = require('react');
const ReactRedux = require('react-redux');
const DocumentTitle = require('react-document-title');

const notebookActionCreators = require('../reducers/notebooks');
const reactAsync = require('../helpers/reactAsync');

const Frame = require('./Frame');

const Notebook = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Notebook',

  componentWillMount: function() {
    if(!this.props.frames) {
      reactAsync.addPromise(this.props.loadNotebook(this.props.id));
    }
  },

  onFrameDimensionChange: function(frame, x, y, width, height) {
    this.props.updateFrame(_.assign({}, frame, { x, y, width, height }));
  },

  // Describe how to render the component
  render: function() {
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
          onDimensionChange={_.partial(this.onFrameDimensionChange, frame)}
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
});

module.exports = ReactRedux.connect(
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
