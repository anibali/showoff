import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import red from 'material-ui/colors/red';
import orange from 'material-ui/colors/orange';
import { ListItem, ListItemText } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import LockIcon from 'material-ui-icons/Lock';
import LockOpenIcon from 'material-ui-icons/LockOpen';
import ModeEditIcon from 'material-ui-icons/ModeEdit';
import DeleteForeverIcon from 'material-ui-icons/DeleteForever';
import Avatar from 'material-ui/Avatar';

import TagList from './TagList';


const styles = () => ({
  disabled: {
    opacity: 0.3,
    filter: 'grayscale(100%)',
    cursor: 'not-allowed',
  },
  redAvatar: {
    backgroundColor: red[500],
  },
  orangeAvatar: {
    backgroundColor: orange[500],
  },
});

const absorbClick = (event) => {
  event.preventDefault();
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
    const { notebook, onChangePinned, onClickEdit, onClickDelete, classes } = this.props;
    const tags = notebook.tags || this.defaultTags;

    return (
      <ListItem dense button component={Link} to={`/notebooks/${notebook.id}`}>
        <IconButton onClick={onChangePinned} onKeyDown={this.onPinnedKeyDown}>
          {notebook.pinned ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
        <ListItemText primary={notebook.title} secondary={new Date(notebook.createdAt).toUTCString()} />
        <TagList tags={tags} />
        <IconButton title="Edit notebook title" onClick={onClickEdit}>
          <Avatar className={classes.orangeAvatar}>
            <ModeEditIcon />
          </Avatar>
        </IconButton>
        <IconButton
          title="Delete notebook"
          onClick={notebook.pinned ? absorbClick : onClickDelete}
          className={notebook.pinned ? classes.disabled : null}
        >
          <Avatar className={classes.redAvatar}>
            <DeleteForeverIcon />
          </Avatar>
        </IconButton>
      </ListItem>
    );
  }
}

export default withStyles(styles)(NotebookListItemView);
