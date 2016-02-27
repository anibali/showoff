const _ = require('lodash');
const React = require('react');
const ReactRedux = require('react-redux');

const Draggable = require('react-draggable');

const notebooksActionCreators = require('../reducers/notebooks');

const onFrameMouseDown = (event) => {
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
};

const Frame = (frame, i) => (
  <Draggable
    key={frame.id} start={{ x: i * 30, y: i * 30 }}
    handle=".frame-handle"
    onMouseDown={onFrameMouseDown}
  >
    <div className="frame">
      <div className="frame-handle">{frame.title || '<untitled frame>'}</div>
      <div className="frame-content">{frame.content}</div>
    </div>
  </Draggable>
);

const Notebook = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Notebook',

  // Describe how to render the component
  render: function() {
    return (
      <div className="fill-space">
        {_.map(this.props.frames, Frame)}
      </div>
    );
  }
});

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({
    frames: state.notebooks[0].frames
  }),

  (dispatch) => ({
    refreshNotebook: _.flow(notebooksActionCreators.refreshNotebook, dispatch),
  })
)(Notebook);
