import React from 'react';
import _ from 'lodash';
import { withContentRect } from 'react-measure';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';


class PlotlyPlot extends React.PureComponent {
  constructor(props) {
    super(props);

    this.PlotlyComponent = createPlotlyComponent(Plotly);

    this.onInitialized = (el) => {
      this.relayout = (width, height) => Plotly.relayout(el, { width, height });
    };
  }

  componentDidUpdate() {
    if(this.relayout) {
      const { width, height } = this.props.contentRect.bounds;
      this.relayout(width, height);
    }
  }

  render() {
    const { PlotlyComponent } = this;

    return (
      <div ref={this.props.measureRef} className="size100">
        <PlotlyComponent
          onInitialized={this.onInitialized}
          {..._.pick(this.props, ['data', 'layout'])}
          fit={false}
        />
      </div>
    );
  }
}


export default withContentRect('bounds')(PlotlyPlot);
