const React = require('react');
const ReactRedux = require('react-redux');
const { Link } = require('react-router');
const _ = require('lodash');

const notebookActionCreators = require('../reducers/notebooks');
const reactAsync = require('../helpers/reactAsync');

const NotebookListItem = React.createClass({
  displayName: 'NotebookListItem',

  getInitialState: function() {
    return { editing: false, title: this.props.notebook.title };
  },

  // Describe how to render the component
  render: function() {
    const { notebook, deleteNotebook, updateNotebook } = this.props;

    if(this.state.editing) {
      const onChangeTitle = (event) => {
        event.preventDefault();
        this.setState({ title: event.target.value });
      };

      const onClickConfirmEdit = (event) => {
        event.preventDefault();
        this.setState({ editing: !this.state.editing });
        updateNotebook(_.assign({}, notebook, { title: this.state.title }));
      };

      const onClickCancelEdit = (event) => {
        event.preventDefault();
        this.setState({ editing: !this.state.editing, title: this.props.notebook.title });
      };

      return (
        <div className="list-group-item">
          <div className="input-group">
            <input type="text"
              className="form-control"
              value={this.state.title}
              onChange={onChangeTitle}
            />
            <span className="input-group-btn">
              <button className="btn btn-success" type="button" onClick={onClickConfirmEdit}>
                <span className="fa fa-check" />
              </button>
              <button className="btn btn-default" type="button" onClick={onClickCancelEdit}>
                <span className="fa fa-times" />
              </button>
            </span>
          </div>
        </div>
      );
    }

    const onClickDelete = (event) => {
      event.preventDefault();
      deleteNotebook(notebook.id);
    };

    const onClickEdit = (event) => {
      event.preventDefault();
      this.setState({ editing: !this.state.editing });
    };

    return (
      <Link className="list-group-item" to={`/notebooks/${notebook.id}`}>
        <span>
          {notebook.title}
          <small style={{ paddingLeft: 8 }} className="text-muted">
            {new Date(notebook.createdAt).toUTCString()}
          </small>
        </span>
        <button className="btn-xs btn-danger pull-right" onClick={onClickDelete}>
          <span className="fa fa-trash-o" />
        </button>
        <button className="btn-xs btn-warning pull-right" onClick={onClickEdit}>
          <span className="fa fa-edit" />
        </button>
      </Link>
    );
  }
});

const Home = React.createClass({
  displayName: 'Home',

  componentWillMount: function() {
    // TODO: Skip doing this if it has already been done (probably
    // requires a boolean flag in the store or something)
    reactAsync.addPromise(this.props.loadNotebooksShallow());
  },

  // Describe how to render the component
  render: function() {
    const notebooks = _.reverse(_.sortBy(this.props.notebooks, (notebook) => notebook.createdAt));

    const createListItem = (notebook) =>
      <NotebookListItem
        key={notebook.id}
        notebook={notebook}
        deleteNotebook={this.props.deleteNotebook}
        updateNotebook={this.props.updateNotebook}
      />;

    return (
      <div className="container">
        <h1>Notebooks</h1>
        <div className="list-group">
          {notebooks.map(createListItem)}
        </div>
      </div>
    );
  }
});

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({ notebooks: state.notebooks }),
  (dispatch) => ({
    loadNotebooksShallow: _.flow(notebookActionCreators.loadNotebooksShallow, dispatch),
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch)
  })
)(Home);
