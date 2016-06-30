const _ = require('lodash');
const React = require('react');
const ReactRedux = require('react-redux');
const DocumentTitle = require('react-document-title');

const Draggable = require('react-draggable');
const Resizable = require('react-resizable').Resizable;

const notebookActionCreators = require('../reducers/notebooks');
const reactAsync = require('../helpers/reactAsync');

const Frame = React.createClass({
  getInitialState: function() {
    return { width: 480, height: 360 };
  },

  onResize: function(event, data) {
    this.setState(_.pick(data.size, ['width', 'height']));
  },

  onMouseDown: function(event) {
    // Bring frame to front
    const draggables = document.getElementsByClassName('react-draggable');
    const maxZ = _.reduce(draggables, (runningMax, element) => {
      const z = parseInt(
        document.defaultView.getComputedStyle(element, null).getPropertyValue('z-index'), 10);
      return _.max([z, runningMax]);
    }, 0);
    let draggableElement = event.target;
    while(!draggableElement.classList.contains('react-draggable')) {
      draggableElement = draggableElement.parentElement;
    }
    draggableElement.style.zIndex = maxZ + 1;
  },

  render: function() {
    const i = this.props.i;
    const frame = this.props.frame;
    return (
      <Draggable
        bounds="parent"
        cancel=".react-resizable-handle"
        start={{ x: i * 30, y: i * 30 }}
        handle=".frame-handle"
        onMouseDown={this.onMouseDown}
      >
        <Resizable width={this.state.width} height={this.state.height} onResize={this.onResize}>
          <div className="frame" style={{ width: this.state.width, height: this.state.height }}>
            <div className="frame-handle">{frame.title || '<untitled frame>'}</div>
            <div className="frame-content" dangerouslySetInnerHTML={{ __html: frame.content }} />
          </div>
        </Resizable>
      </Draggable>
    );
  }
});

const createFrame = (frame, i) => (
  <Frame key={frame.id} frame={frame} i={i} />
);

const Notebook = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Notebook',

  componentWillMount: function() {
    if(!this.props.frames) {
      reactAsync.addPromise(this.props.loadNotebook(this.props.id));
    }
  },

  // Describe how to render the component
  render: function() {
    let children = null;
    if(this.props.frames) {
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
    loadNotebook: _.flow(notebookActionCreators.loadNotebook, dispatch)
  })
)(Notebook);
