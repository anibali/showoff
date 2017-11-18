import React from 'react';
import _ from 'lodash';
import { withStyles } from 'material-ui/styles';
import { ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Button from 'material-ui/Button';

import TagInput from '../TagInput';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

class NotebookListItemEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: this.props.notebook.title, tags: this.props.notebook.tags };
  }

  // Describe how to render the component
  render() {
    const { notebook, onConfirmEdit, onCancelEdit, classes } = this.props;

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

    const tags = notebook.tags || [];
    const tagOptions = this.props.tagOptions || [];

    const tagFieldId = `notebook-tags-field-${notebook.id}`;

    return (
      <ListItem dense>
        <form onSubmit={onSubmitForm} style={{ width: '100%' }}>
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
              initialTags={tags}
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

export default withStyles(styles)(NotebookListItemEdit);
