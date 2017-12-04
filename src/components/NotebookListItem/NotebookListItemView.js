import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import red from 'material-ui/colors/red';
import orange from 'material-ui/colors/orange';
import teal from 'material-ui/colors/teal';
import { ListItem, ListItemText } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import LockIcon from 'material-ui-icons/Lock';
import LockOpenIcon from 'material-ui-icons/LockOpen';
import ModeEditIcon from 'material-ui-icons/ModeEdit';
import DeleteForeverIcon from 'material-ui-icons/DeleteForever';
import Avatar from 'material-ui/Avatar';
import { CircularProgress } from 'material-ui/Progress';
import DoneIcon from 'material-ui-icons/Done';
import ErrorIcon from 'material-ui-icons/Error';
import PendingIcon from 'material-ui-icons/Timer';

import TagList from './TagList';


const styles = {
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
  progressStackedOuter: {
    position: 'relative',
  },
  progressStackedInner: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  errorStatus: {
    color: red[500],
  },
  doneStatus: {
    color: teal[500],
  },
  pendingStatus: {
    color: orange[500],
  }
};

const absorbClick = (event) => {
  event.preventDefault();
};

const ProgressStatus = ({ value, error, classes }) => {
  let statusClass;
  let IconComponent;

  if(error) {
    statusClass = classes.errorStatus;
    IconComponent = ErrorIcon;
  } else if(value >= 100) {
    statusClass = classes.doneStatus;
    IconComponent = DoneIcon;
  } else {
    statusClass = classes.pendingStatus;
    IconComponent = PendingIcon;
  }

  return (
    <div className={[classes.progressStackedOuter, statusClass].join(' ')}>
      <IconComponent className={classes.progressStackedInner} />
      <CircularProgress color="inherit" mode="determinate" value={value} />
    </div>
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
  }

  render() {
    const { notebook, tags, onChangePinned, onClickEdit, onClickDelete, classes } = this.props;

    return (
      <ListItem dense button component={Link} to={`/notebooks/${notebook.id}`}>
        <ProgressStatus classes={classes} value={notebook.attributes.progress * 100} />
        <ListItemText
          primary={notebook.attributes.title}
          secondary={new Date(notebook.attributes.createdAt).toUTCString()}
        />
        <TagList tags={tags} />
        <IconButton onClick={onChangePinned} onKeyDown={this.onPinnedKeyDown}>
          {notebook.attributes.pinned ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
        <IconButton title="Edit notebook title" onClick={onClickEdit}>
          <Avatar className={classes.orangeAvatar}>
            <ModeEditIcon />
          </Avatar>
        </IconButton>
        <IconButton
          title="Delete notebook"
          onClick={notebook.attributes.pinned ? absorbClick : onClickDelete}
          className={notebook.attributes.pinned ? classes.disabled : null}
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
