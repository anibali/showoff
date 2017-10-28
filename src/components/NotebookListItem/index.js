const React = require('react');
const _ = require('lodash');

const NotebookListItemView = require('./NotebookListItemView');
const NotebookListItemEdit = require('./NotebookListItemEdit');


class NotebookListItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { editing: false };

    const onClickDelete = (event) => {
      event.preventDefault();
      this.props.deleteNotebook(this.props.notebook.id);
    };
    const onClickEdit = (event) => {
      event.preventDefault();
      this.setState({ editing: !this.state.editing });
    };
    const onChangePinned = (event) => {
      event.preventDefault();
      const updatedNotebook =
        _.assign({}, this.props.notebook, { pinned: !this.props.notebook.pinned });
      this.props.updateNotebook(updatedNotebook);
    };

    this.viewModeChildProps = ({ notebook }) => ({
      notebook,
      onClickDelete,
      onClickEdit,
      onChangePinned,
    });

    const onConfirmEdit = (updatedNotebook) => {
      this.setState({ editing: !this.state.editing });
      this.props.updateNotebook(_.assign({}, this.props.notebook, updatedNotebook));
    };
    const onCancelEdit = () => {
      this.setState({ editing: !this.state.editing });
    };

    this.editModeChildProps = ({ notebook, tagOptions }) => ({
      notebook,
      tagOptions,
      onConfirmEdit,
      onCancelEdit,
    });
  }

  render() {
    if(this.state.editing) {
      return <NotebookListItemEdit {...this.editModeChildProps(this.props)} />;
    }

    return <NotebookListItemView {...this.viewModeChildProps(this.props)} />;
  }
}

module.exports = NotebookListItem;
