import React from 'react';
import withSideEffect from 'react-side-effect';


class BodyClass extends React.Component {
  render() {
    return React.Children.only(this.props.children);
  }
}

const defaultState = '';

const reducePropsToState = (propsList) => {
  if(propsList.length === 0) {
    return defaultState;
  }
  return propsList[propsList.length - 1].className;
};

const handleStateChangeOnClient = (state) => {
  document.body.className = state || defaultState;
};


export default withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient
)(BodyClass);
