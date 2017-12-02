import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';

import NotebookListItemView from './NotebookListItemView';
import NotebookListItemEdit from './NotebookListItemEdit';
import notebookActionCreators from '../../redux/notebooksActionCreators';
import { getFlatNotebookWithTags } from '../../redux/selectors/notebookSelectors';


class NotebookListItem extends React.PureComponent {
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

    this.editModeChildProps = ({ notebook }) => ({
      notebook,
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


export default connect(
  (state, ownProps) => ({
    notebook: getFlatNotebookWithTags(state, ownProps.notebookId),
  }),
  (dispatch) => ({
    deleteNotebook: _.flow(notebookActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(notebookActionCreators.updateNotebook, dispatch),
  })
)(NotebookListItem);
