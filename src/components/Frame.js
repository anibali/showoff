const React = require('react');

const _ = require('lodash');
const Draggable = require('react-draggable');
const Resizable = require('react-resizable').Resizable;

const Frame = React.createClass({
  getDefaultProps: function() {
    return {
      initialX: 0,
      initialY: 0,
      initialWidth: 480,
      initialHeight: 360
    };
  },

  getInitialState: function() {
    return { width: this.props.initialWidth, height: this.props.initialHeight };
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
    const frame = this.props.frame;
    return (
      <Draggable
        bounds="parent"
        cancel=".react-resizable-handle"
        defaultPosition={{ x: this.props.initialX, y: this.props.initialY }}
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

module.exports = Frame;
