const React = require('react');
const reactRedux = require('react-redux');

const Provider = reactRedux.Provider;
const { Router, Route, IndexRoute } = require('react-router');

const App = require('./App');
const Home = require('./Home');
const Notebook = require('./Notebook');

let history;
if(process.env.IN_BROWSER) {
  history = require('react-router').browserHistory;
} else {
  history = require('react-router').createMemoryHistory();
}

/**
 * The root React component from which all other components
 * on the page are descended.
 */
const Root = React.createClass({
  // Display name for the component (useful for debugging)
  displayName: 'Root',

  // Describe how to render the component
  render: function() {
    return (
      <Provider store={this.props.store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={Home}/>
            <Route path="notebooks/:id" component={Notebook} />
          </Route>
        </Router>
      </Provider>
    );
  }
});

// Export the Root component
module.exports = Root;
