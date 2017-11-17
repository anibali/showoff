import _ from 'lodash';
import React from 'react';
import * as ReactRedux from 'react-redux';
import { Route, Redirect } from 'react-router';


const PrivateRoute = (props) => {
  const Component = props.component;
  const rest = _.omit(props, ['component', 'authenticated']);
  const render = rprops => (
    props.authenticated ? (
      <Component {...rprops} />
    ) : (
      <Redirect to={{ pathname: '/login', state: { from: rprops.location } }} />
    )
  );
  return <Route {...rest} render={render} />;
};


export default ReactRedux.connect(
  (state) => ({
    authenticated: state.auth.authenticated,
  })
)(PrivateRoute);
