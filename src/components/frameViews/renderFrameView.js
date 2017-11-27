import React from 'react';


class ReactView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Component: null,
      error: null,
    };
  }

  componentWillMount() {
    if(!process.env.IN_BROWSER) {
      return;
    }

    this.props.loadComponent()
      .then(Component => this.setState({ Component }))
      .catch(error => {
        console.error(error);
        this.setState({ error });
      });
  }

  render() {
    const { Component } = this.state;

    if(this.state.error) {
      return <span>Error</span>;
    }

    if(!Component) {
      return <span>Loading...</span>;
    }

    return <Component {...this.props.componentProps} />;
  }
}

const loadPlotlyViewComponent = () => new Promise((resolve, reject) => {
  require.ensure(
    ['./PlotlyView'],
    (require) => resolve(require('./PlotlyView').default),
    reject,
    'plotly'
  );
});


export default (frame) => {
  if(frame.type === 'plotly') {
    return (
      <ReactView
        componentProps={frame.content}
        loadComponent={loadPlotlyViewComponent}
      />
    );
  }

  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{ __html: frame.renderedContent }} />;
};
