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
  const { type, content, renderedContent } = frame.attributes;

  if(type === 'plotly') {
    return (
      <ReactView
        componentProps={content}
        loadComponent={loadPlotlyViewComponent}
      />
    );
  }

  // eslint-disable-next-line react/no-danger
  return <div className="size100" dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};
