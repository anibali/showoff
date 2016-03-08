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
    <Link className="list-group-item" to={`/notebooks/${notebook.id}`}>
      {notebook.title}
      <small style={{ paddingLeft: 8 }} className="text-muted">{notebook.createdAt}</small>
      <button className="btn-xs btn-danger pull-right" onClick={onClickDelete}>
        <span className="fa fa-trash-o" />
      </button>
    </Link>
  );
};

const Home = ({ notebooks, deleteNotebook }) => {
  const createListItem = (notebook) =>
    (<NotebookListItem key={notebook.id} notebook={notebook} deleteNotebook={deleteNotebook} />);

  return (
    <div className="container">
      <h1>Notebooks</h1>
      <div className="list-group">
        {notebooks.map(createListItem)}
      </div>
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
