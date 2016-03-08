const React = require('react');
const ReactRedux = require('react-redux');
const { Link } = require('react-router');
const _ = require('lodash');

const notebookActionCreators = require('../reducers/notebooks');

const NotebookListItem = ({ notebook, deleteNotebook }) => {
  const onClickDelete = (event) => {
    event.preventDefault();
    deleteNotebook(notebook.id);
  };

  return (
    <li className="list-group-item">
      <Link to={`/notebooks/${notebook.id}`}>
        {notebook.title}
      </Link>
      <button className="btn-xs btn-danger pull-right" onClick={onClickDelete}>
        <span className="fa fa-trash-o" />
      </button>
    </li>
  );
};

const Home = ({ notebooks, deleteNotebook }) => {
  const createListItem = (notebook) =>
    (<NotebookListItem key={notebook.id} notebook={notebook} deleteNotebook={deleteNotebook} />);

  return (
    <div className="container">
      <h1>Notebooks</h1>
      <ul className="list-group">
        {notebooks.map(createListItem)}
      </ul>
    </div>
  );
};

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({ notebooks: state.notebooks }),
  (dispatch) => ({
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch)
  })
)(Home);
