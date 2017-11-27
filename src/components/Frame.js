import React from 'react';
import _ from 'lodash';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';

class Frame extends React.Component {
  render() {
    const onResize = (event, data) => {
      this.props.onDimensionChange(
        this.props.frame.x, this.props.frame.y, data.size.width, data.size.height, true);
    };

    const onDrag = (event, data) => {
      this.props.onDimensionChange(
        data.x, data.y, this.props.frame.width, this.props.frame.height, true);
    };

    const triggerDimensionChange = () => {
      this.props.onDimensionChange(
        this.props.frame.x, this.props.frame.y,
        this.props.frame.width, this.props.frame.height, false);
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

    const { frame } = this.props;

    const dragBounds = {
      left: 0,
      right: this.props.containerWidth - (this.props.frame.width + 2),
      top: 0,
      bottom: this.props.containerHeight - (this.props.frame.height + 2),
    };

    return (
      <Draggable
        bounds={dragBounds}
        cancel=".react-resizable-handle"
        position={{ x: this.props.frame.x, y: this.props.frame.y }}
        handle=".frame-handle"
        onMouseDown={onMouseDown}
        onDrag={onDrag}
        onStop={triggerDimensionChange}
      >
        <Resizable
          width={this.props.frame.width}
          height={this.props.frame.height}
          onResize={onResize}
          onResizeStop={triggerDimensionChange}
        >
          <div className="frame" style={{ width: this.props.frame.width, height: this.props.frame.height }}>
            <div className="frame-handle">{frame.title || '<untitled frame>'}</div>
            <div className="frame-content" dangerouslySetInnerHTML={{ __html: frame.renderedContent }} />
          </div>
        </Resizable>
      </Draggable>
    );
  }
}

export default Frame;
