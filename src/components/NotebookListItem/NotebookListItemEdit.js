import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import { ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import { FormControl } from 'material-ui/Form';
import Button from 'material-ui/Button';

import TagInput from '../TagInput';
import { getTagNames } from '../../redux/selectors/tagSelectors';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

class NotebookListItemEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.notebook.attributes.title,
      tags: this.props.tags.map(tag => ({ name: tag.attributes.name })),
    };
  }

  // Describe how to render the component
  render() {
    const { notebook, onConfirmEdit, onCancelEdit, classes } = this.props;
    const initialTags = this.props.tags.map(tag => ({ name: tag.attributes.name }));

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

    const onTagsChange = (tags) => {
      this.setState({ tags: tags.map(item => _.pick(item, 'name')) });
    };

    const tagOptions = this.props.tagOptions || [];

    const tagFieldId = `notebook-tags-field-${notebook.id}`;

    return (
      <ListItem dense>
        <form className="size100" onSubmit={onSubmitForm}>
          <TextField
            fullWidth
            label="Title"
            type="text"
            value={this.state.title}
            onChange={onChangeTitle}
            autoFocus
          />
          <FormControl fullWidth>
            <TagInput
              id={tagFieldId}
              suggestions={tagOptions}
              initialTags={initialTags}
              onChange={onTagsChange}
              placeholder="Add tag"
              allowNew
            />
          </FormControl>
          <div>
            <Button className={classes.button} dense raised color="primary" type="submit">
              Save
            </Button>
            <Button className={classes.button} dense raised onClick={onClickCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </ListItem>
    );
  }
}

export default withStyles(styles)(connect(
  (state) => ({
    tagOptions: getTagNames(state),
  }),
)(NotebookListItemEdit));
