import React from 'react';
import _ from 'lodash';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

class Frame extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      x: this.props.initialX,
      y: this.props.initialY,
      width: this.props.initialWidth,
      height: this.props.initialHeight
    };
  }

  static get defaultProps() {
    return {
      initialX: 0,
      initialY: 0,
      initialWidth: 480,
      initialHeight: 360
    };
  }

  render() {
    const onResize = (event, data) => {
      this.setState(_.pick(data.size, ['width', 'height']));
    };

    const onDrag = (event, data) => {
      this.setState(_.pick(data, ['x', 'y']));
    };

    const triggerDimensionChange = () => {
      this.props.onDimensionChange(this.state.x, this.state.y, this.state.width, this.state.height);
    };

    const onMouseDown = (event) => {
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
    };

    const frame = this.props.frame;

    return (
      <Draggable
        bounds="parent"
        cancel=".react-resizable-handle"
        defaultPosition={{ x: this.props.initialX, y: this.props.initialY }}
        handle=".frame-handle"
        onMouseDown={onMouseDown}
        onDrag={onDrag}
        onStop={triggerDimensionChange}
      >
        <Resizable
          width={this.state.width}
          height={this.state.height}
          onResize={onResize}
          onResizeStop={triggerDimensionChange}
        >
          <div className="frame" style={{ width: this.state.width, height: this.state.height }}>
            <div className="frame-handle">{frame.title || '<untitled frame>'}</div>
            <div className="frame-content" dangerouslySetInnerHTML={{ __html: frame.content }} />
          </div>
        </Resizable>
      </Draggable>
    );
  }
}

export default Frame;
