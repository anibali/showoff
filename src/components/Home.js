const React = require('react');
const ReactRedux = require('react-redux');
const { Link } = require('react-router');
const _ = require('lodash');

const notebookActionCreators = require('../reducers/notebooks');
const reactAsync = require('../helpers/reactAsync');

class NotebookListItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { editing: false, title: this.props.notebook.title };
  }

  // Describe how to render the component
  render() {
    const { notebook, deleteNotebook, updateNotebook } = this.props;

    if(this.state.editing) {
      const onChangeTitle = (event) => {
        event.preventDefault();
        this.setState({ title: event.target.value });
      };

      const confirmEdit = (event) => {
        event.preventDefault();
        this.setState({ editing: !this.state.editing });
        updateNotebook(_.assign({}, notebook, { title: this.state.title }));
      };

      const cancelEdit = (event) => {
        event.preventDefault();
        this.setState({ editing: !this.state.editing, title: this.props.notebook.title });
      };

      const onKeyDownTitle = (event) => {
        if(event.keyCode === 13) { // Enter key
          confirmEdit(event);
        } else if(event.keyCode === 27) { // Escape key
          cancelEdit(event);
        }
      };

      return (
        <div className="list-group-item">
          <div className="input-group">
            <input type="text"
              className="form-control"
              autoFocus
              value={this.state.title}
              onChange={onChangeTitle}
              onKeyDown={onKeyDownTitle}
            />
            <span className="input-group-btn">
              <button className="btn btn-success" type="button" onClick={confirmEdit}>
                <span className="fa fa-check" />
              </button>
              <button className="btn btn-default" type="button" onClick={cancelEdit}>
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

    const onChangePinned = (event) => {
      event.preventDefault();
      updateNotebook(_.assign({}, notebook, { pinned: !notebook.pinned }));
    };

    return (
      <Link className="list-group-item" to={`/notebooks/${notebook.id}`}>
        <div
          style={{ display: 'inline-block',
            color: notebook.pinned ? '#369' : '#aaa',
            paddingRight: 8 }}
          onClick={onChangePinned}
        >
          <span className="fa-stack fa-lg" style={{ fontSize: '0.9em' }}>
            <i className="fa fa-square-o fa-stack-2x"></i>
            <i className="fa fa-thumb-tack fa-stack-1x"></i>
          </span>
        </div>
        <span>
          {notebook.title}
          <small style={{ paddingLeft: 8 }} className="text-muted">
            {new Date(notebook.createdAt).toUTCString()}
          </small>
        </span>
        <div className="btn-group pull-right" role="group">
          <button className="btn btn-xs btn-warning btn-notebook-list"
            title="Edit notebook title"
            onClick={onClickEdit}
          >
            <span className="fa fa-edit" />
          </button>
          <button className="btn btn-xs btn-danger btn-notebook-list"
            title="Delete notebook"
            onClick={onClickDelete} disabled={ notebook.pinned }
          >
            <span className="fa fa-trash-o" />
          </button>
        </div>
      </Link>
    );
  }
}

class Home extends React.PureComponent {
  componentWillMount() {
    // TODO: Skip doing this if it has already been done (probably
    // requires a boolean flag in the store or something)
    reactAsync.addPromise(this.props.loadNotebooksShallow());
  }

  // Describe how to render the component
  render() {
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
}

module.exports = ReactRedux.connect(
  // Map store state to props
  (state) => ({ notebooks: state.notebooks }),
  (dispatch) => ({
    loadNotebooksShallow: _.flow(notebookActionCreators.loadNotebooksShallow, dispatch),
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch)
  })
)(Home);
