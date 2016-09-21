const React = require('react');
const { Route, IndexRoute } = require('react-router');

const App = require('./components/App');
const Home = require('./components/Home');
const Notebook = require('./components/Notebook');

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="notebooks" component={Home} />
    <Route path="notebooks/:id" component={Notebook} />
  </Route>
);

module.exports = routes;
