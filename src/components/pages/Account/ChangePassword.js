import React from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';


const styles = theme => ({
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  paper: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      oldPassword: '',
      newPassword: '',
      newPassword2: '',
    };

    this.onChangeOldPassword = (event) => {
      this.setState({ oldPassword: event.target.value });
    };

    this.onChangeNewPassword = (event) => {
      this.setState({ newPassword: event.target.value });
    };

    this.onChangeNewPassword2 = (event) => {
      this.setState({ newPassword2: event.target.value });
    };

    const validate = () => (
      this.state.newPassword === this.state.newPassword2
        && this.state.oldPassword !== ''
        && this.state.newPassword !== ''
    );

    this.onSubmit = (event) => {
      event.preventDefault();

      if(validate()) {
        this.props.onSubmit({
          oldPassword: this.state.oldPassword,
          newPassword: this.state.newPassword,
        });
      }
    };
  }

  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.paper}>
        <form onSubmit={this.onSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Old password"
            InputLabelProps={{ shrink: true }}
            type="password"
            value={this.state.oldPassword}
            onChange={this.onChangeOldPassword}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New password"
            InputLabelProps={{ shrink: true }}
            type="password"
            value={this.state.newPassword}
            onChange={this.onChangeNewPassword}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm new password"
            InputLabelProps={{ shrink: true }}
            type="password"
            value={this.state.newPassword2}
            onChange={this.onChangeNewPassword2}
          />
          <Button className={classes.button} color="primary" type="submit">
            Update password
          </Button>
        </form>
      </Paper>
    );
  }
}


export default withStyles(styles)(ChangePassword);
