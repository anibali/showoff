const React = require('react');
const ReactRedux = require('react-redux');
const { Link } = require('react-router');

const createListItem = (notebook) => (
  <li key={notebook.id}>
    <Link to={'/notebooks/' + notebook.id}>
      {notebook.title}
    </Link>
  </li>
);

const Home = ({ notebooks }) => (
  <ul>
    {notebooks.map(createListItem)}
  </ul>
);

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => {
    return { notebooks: state.notebooks };
  }
)(Home);
