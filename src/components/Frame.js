import React from 'react';
import _ from 'lodash';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import renderFrameView from './frameViews/renderFrameView';


const FrameContent = ({ frame, showContent }) => {
  const content = showContent ? renderFrameView(frame) : null;
  return (
    <div className="frame-content">
      {content}
    </div>
  );
};


class Frame extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showContent: true };
  }

  render() {
    const onResize = (event, data) => {
      event.preventDefault();
      const { x, y } = this.props.frame.attributes;
      const { width, height } = data.size;
      this.setState({ showContent: false });
      this.props.onDimensionChange(x, y, width, height, true);
    };

    const onDrag = (event, data) => {
      event.preventDefault();
      const { x, y } = data;
      const { width, height } = this.props.frame.attributes;
      this.props.onDimensionChange(x, y, width, height, true);
    };

    const triggerDimensionChange = () => {
      const { x, y, width, height } = this.props.frame.attributes;
      this.props.onDimensionChange(x, y, width, height, false);
      this.setState({ showContent: true });
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
    const { x, y, width, height, title } = frame.attributes;

    const dragBounds = {
      left: 0,
      right: this.props.containerWidth - (width + 2),
      top: 0,
      bottom: this.props.containerHeight - (height + 2),
    };

    return (
      <Draggable
        bounds={dragBounds}
        cancel=".react-resizable-handle"
        position={{ x, y }}
        handle=".frame-handle"
        onMouseDown={onMouseDown}
        onDrag={onDrag}
        onStop={triggerDimensionChange}
      >
        <Resizable
          width={width}
          height={height}
          onResize={onResize}
          onResizeStop={triggerDimensionChange}
        >
          <div className="frame" style={{ width, height }}>
            <div className="frame-handle">{title || '<untitled frame>'}</div>
            <FrameContent frame={frame} showContent={this.state.showContent} />
          </div>
        </Resizable>
      </Draggable>
    );
  }
}


export default Frame;
