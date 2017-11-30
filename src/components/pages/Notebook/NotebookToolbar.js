import React from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpandLessIcon from 'material-ui-icons/ExpandLess';
import GridIcon from 'material-ui-icons/ViewModule';


const styles = {
  collapsedToolbar: {
    zIndex: 9999,
    position: 'absolute',
    color: 'white',
    right: 0,
  },
  expandButton: {
    width: 48,
    height: 48,
  },
};

class NotebookToolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidden: true,
    };

    this.show = () => {
      this.setState({ hidden: false });
    };

    this.hide = () => {
      this.setState({ hidden: true });
    };
  }

  render() {
    const { classes } = this.props;

    if(this.state.hidden) {
      return (
        <Toolbar className={classes.collapsedToolbar}>
          <Button className={classes.expandButton} fab color="primary" onClick={this.show}>
            <ExpandMoreIcon />
          </Button>
        </Toolbar>
      );
    }
    return (
      <AppBar position="static">
        <Toolbar>
          <Button color="contrast" to="/" component={Link}>Home</Button>
          <IconButton color="contrast" onClick={this.props.onClickGrid}>
            <GridIcon />
          </IconButton>
          <div className="flex1" />
          <IconButton color="contrast" onClick={this.hide}>
            <ExpandLessIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}


export default withStyles(styles)(NotebookToolbar);
