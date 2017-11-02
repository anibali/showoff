import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Home from './components/Home';
import Notebook from './components/Notebook';

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="notebooks" component={Home} />
    <Route path="notebooks/:id" component={Notebook} />
  </Route>
);

export default routes;
