const React = require('react');
const { Link } = require('react-router');

const Home = () => (
  <div>
    <Link to={'/notebooks/' + 1}>
      Notebook 1
    </Link>
  </div>
);

module.exports = Home;
