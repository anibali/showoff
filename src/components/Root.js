import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';

import App from './App';
import NotFound from './NotFound';
import frontendRoutes from './frontendRoutes';

export default ({ store, location, context, Router }) => (
  <Provider store={store}>
    <Router location={location} context={context}>
      <App>
        <Switch>
          {frontendRoutes.map(r => <Route key={r.path} {...r} />)}
          <Route component={NotFound} />
        </Switch>
      </App>
    </Router>
  </Provider>
);
