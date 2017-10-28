const React = require('react');
const _ = require('lodash');
const { Typeahead } = require('react-bootstrap-typeahead');


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

    const onSubmitForm = (event) => {
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

    const titleFieldId = `notebook-title-field-${notebook.id}`;
    const tagFieldId = `notebook-tags-field-${notebook.id}`;

    return (
      <div className="list-group-item">
        <form className="form-horizontal" onSubmit={onSubmitForm}>
          <div className="form-group">
            <label htmlFor={titleFieldId} className="col-md-1 control-label">
              Title
            </label>
            <div className="col-md-11">
              <input
                type="text"
                id={titleFieldId}
                className="form-control"
                value={this.state.title}
                onChange={onChangeTitle}
              />
            </div>

          </div>
          <div className="form-group">
            <label htmlFor={tagFieldId} className="col-md-1 control-label">
              Tags
            </label>
            <div className="col-md-11">
              <Typeahead
                id={tagFieldId}
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
                <input
                  type="submit"
                  value="Save"
                  className="btn btn-success"
                />
                <button className="btn btn-default" onClick={onClickCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

module.exports = NotebookListItemEdit;
