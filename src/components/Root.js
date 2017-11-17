import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';

import App from './App';
import frontendRoutes from './frontendRoutes';
import PrivateRoute from './PrivateRoute';

const buildRoute = ({ path, component, exact, requiresAuth }) => {
  const RouteComponent = requiresAuth ? PrivateRoute : Route;
  const props = {
    key: path, path, component, exact,
  };
  return <RouteComponent {...props} />;
};

export default ({ store, location, context, Router }) => (
  <Provider store={store}>
    <Router location={location} context={context}>
      <App>
        <Switch>
          {frontendRoutes.map(buildRoute)}
        </Switch>
      </App>
    </Router>
  </Provider>
);
