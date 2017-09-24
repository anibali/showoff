const React = require('react');
const { Link } = require('react-router');
const _ = require('lodash');
const { Typeahead } = require('react-bootstrap-typeahead');

const contrastBW = (hex) => {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? '#000000' : '#ffffff';
};

const textToColour = (text) => {
  let hash = 17;
  for(let i = 0; i < text.length; ++i) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const TagList = ({ tags }) => {
  const children = tags.map(tag => {
    const backgroundColor = textToColour(tag.name);
    const style = {
      backgroundColor,
      color: contrastBW(backgroundColor)
    };
    return <span key={tag.id} className="label" style={style}>{tag.name}</span>;
  });
  return (
    <span style={{ paddingLeft: 6 }}>
      {children}
    </span>
  );
};

const NotebookListItemView = ({ notebook, onChangePinned, onClickEdit, onClickDelete }) => {
  const tags = notebook.tags || [];

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
        <TagList tags={tags} />
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
};

class NotebookListItemEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: this.props.notebook.title, tags: this.props.notebook.tags };
  }

  // Describe how to render the component
  render() {
    const { notebook, onConfirmEdit, onCancelEdit } = this.props;

    const onChangeTitle = (event) => {
      event.preventDefault();
      this.setState({ title: event.target.value });
    };

    const onKeyDownTitle = (event) => {
      if(event.keyCode === 13) { // Enter key
        event.preventDefault();
        onConfirmEdit(event);
      } else if(event.keyCode === 27) { // Escape key
        event.preventDefault();
        onCancelEdit(event);
      }
    };

    const onClickConfirm = (event) => {
      event.preventDefault();
      onConfirmEdit({ title: this.state.title, tags: this.state.tags });
    };

    const onClickCancel = (event) => {
      event.preventDefault();
      onCancelEdit();
    };

    const onTagsChange = (selectedItems) => {
      this.setState({ tags: selectedItems.map(item => _.pick(item, 'name')) });
    };

    const tags = notebook.tags || [];
    const tagOptions = this.props.tagOptions || [];

    return (
      <div className="list-group-item">
        <div className="form-horizontal">
          <div className="form-group">
            <label htmlFor={`notebook-title-field-${notebook.id}`} className="col-md-1 control-label">Title</label>
            <div className="col-md-11">
              <input type="text"
                id={`notebook-title-field-${notebook.id}`}
                className="form-control"
                autoFocus
                value={this.state.title}
                onChange={onChangeTitle}
                onKeyDown={onKeyDownTitle}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor={`notebook-tags-field-${notebook.id}`} className="col-md-1 control-label">Tags</label>
            <div className="col-md-11">
              <Typeahead
                id={`notebook-tags-field-${notebook.id}`}
                clearButton
                labelKey="name"
                multiple
                options={tagOptions}
                defaultSelected={tags}
                placeholder="Choose tags..."
                onChange={onTagsChange}
                allowNew
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="col-md-offset-1 col-md-11">
              <div className="btn-toolbar">
                <button className="btn btn-success" type="button" onClick={onClickConfirm}>
                  Save
                </button>
                <button className="btn btn-default" type="button" onClick={onClickCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class NotebookListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editing: false };
  }

  // Describe how to render the component
  render() {
    const { notebook, deleteNotebook, updateNotebook } = this.props;

    if(this.state.editing) {
      const onConfirmEdit = (updatedNotebook) => {
        this.setState({ editing: !this.state.editing });
        updateNotebook(_.assign({}, notebook, updatedNotebook));
      };

      const onCancelEdit = () => {
        this.setState({ editing: !this.state.editing });
      };

      return (
        <NotebookListItemEdit
          notebook={notebook}
          onConfirmEdit={onConfirmEdit}
          onCancelEdit={onCancelEdit}
          tagOptions={this.props.tagOptions}
        />
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
      <NotebookListItemView
        notebook={notebook}
        onClickDelete={onClickDelete}
        onClickEdit={onClickEdit}
        onChangePinned={onChangePinned}
      />
    );
  }
}

module.exports = NotebookListItem;
