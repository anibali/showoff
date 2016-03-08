const React = require('react');

const App = (props) => (
  <div className="fill-space">
    {props.children}
  </div>
);

module.exports = App;
