import React from 'react';
import _ from 'lodash';
import { assocIn, merge } from 'icepick';
import { connect } from 'react-redux';

import NotebookListItemView from './NotebookListItemView';
import NotebookListItemEdit from './NotebookListItemEdit';
import complexActionCreators from '../../redux/complexActionCreators';
import { getNotebook } from '../../redux/selectors/notebookSelectors';
import { getNotebookTags } from '../../redux/selectors/tagSelectors';


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
      const { notebook, updateNotebook } = this.props;
      updateNotebook(
        assocIn(notebook, ['attributes', 'pinned'], !notebook.attributes.pinned)
      );
    };

    this.viewModeChildProps = ({ notebook, tags }) => ({
      notebook,
      tags,
      onClickDelete,
      onClickEdit,
      onChangePinned,
    });

    const onConfirmEdit = ({ title, tags }) => {
      this.setState({ editing: !this.state.editing });
      const { notebook, updateNotebook } = this.props;
      updateNotebook(
        merge(notebook, { attributes: { title } }),
        tags.map(({ name }) => ({ attributes: { name } }))
      );
    };
    const onCancelEdit = () => {
      this.setState({ editing: !this.state.editing });
    };

    this.editModeChildProps = ({ notebook, tags }) => ({
      notebook,
      tags,
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
    notebook: getNotebook(state, ownProps.notebookId),
    tags: getNotebookTags(state, ownProps.notebookId),
  }),
  (dispatch) => ({
    deleteNotebook: _.flow(complexActionCreators.deleteNotebook, dispatch),
    updateNotebook: _.flow(complexActionCreators.updateNotebook, dispatch),
  })
)(NotebookListItem);
