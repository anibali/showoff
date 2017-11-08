import React from 'react';
import { Link } from 'react-router';
import TagList from './TagList';


const absorbClick = (event) => {
  event.preventDefault();
};

const ItemProgress = ({ progress }) => {
  if(progress == null || progress <= 0.0) {
    return null;
  }

  return (
    <div
      className="nli-progress"
      style={{
        width: `${progress * 100}%`,
        backgroundColor: progress >= 1 ? '#e6fff0' : '#e6f0ff',
      }}
    />
  );
};

class NotebookListItemView extends React.Component {
  constructor(props) {
    super(props);

    this.onPinnedKeyDown = (event) => {
      if(event.keyCode === 13) {
        this.props.onChangePinned(event);
      }
    };

    this.defaultTags = [];
  }

  render() {
    const { notebook, onChangePinned, onClickEdit, onClickDelete } = this.props;
    const tags = notebook.tags || this.defaultTags;

    return (
      <Link className="list-group-item" to={`/notebooks/${notebook.id}`}>
        <ItemProgress progress={notebook.progress} />
        <div className="nli clearfix">
          <div className="nli-col-left">
            <span
              className={`nli-pin nli-pin-${notebook.pinned ? 'active' : 'inactive'}`}
              role="button"
              tabIndex={0}
              onClick={onChangePinned}
              onKeyDown={this.onPinnedKeyDown}
            >
              <span className="fa-stack fa-lg">
                <i className="fa fa-square-o fa-stack-2x" />
                <i className="fa fa-thumb-tack fa-stack-1x" />
              </span>
            </span>
          </div>
          <div className="nli-col-centre">
            <span>
              {notebook.title}
              <small className="nli-timestamp text-muted">
                {new Date(notebook.createdAt).toUTCString()}
              </small>
              <TagList tags={tags} />
            </span>
          </div>
          <div className="nli-col-right">
            <button
              className="btn btn-xs btn-warning nli-btn"
              title="Edit notebook title"
              onClick={onClickEdit}
            >
              <span className="fa fa-edit" />
            </button>
            <button
              className={`btn btn-xs btn-danger nli-btn ${notebook.pinned ? ' nli-btn-disabled' : ''}`}
              title="Delete notebook"
              onClick={notebook.pinned ? absorbClick : onClickDelete}
            >
              <span className="fa fa-trash-o" />
            </button>
          </div>
        </div>
      </Link>
    );
  }
}

export default NotebookListItemView;
