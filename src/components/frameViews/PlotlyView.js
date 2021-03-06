import React from 'react';
import { thaw } from 'icepick';
import { withContentRect } from 'react-measure';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from '../../helpers/plotlyCustom';


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
      <div ref={this.props.measureRef} className="plotly-frame">
        <PlotlyComponent
          onInitialized={this.onInitialized}
          data={thaw(this.props.data)}
          layout={thaw(this.props.layout)}
          fit={false}
        />
      </div>
    );
  }
}


export default withContentRect('bounds')(PlotlyPlot);
