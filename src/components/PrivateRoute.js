import _ from 'lodash';
import React from 'react';
import { Route, Redirect } from 'react-router';
import auth from './auth';

export default (props) => {
  const Component = props.component;
  const rest = _.omit(props, ['component']);
  const render = rprops => (
    auth.isAuthenticated ? (
      <Component {...rprops} />
    ) : (
      <Redirect to={{ pathname: '/login', state: { from: rprops.location } }} />
    )
  );
  return <Route {...rest} render={render} />;
};
