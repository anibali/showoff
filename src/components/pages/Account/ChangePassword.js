import React from 'react';
import _ from 'lodash';
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
      errors: {},
    };

    const validate = () => {
      const errors = {};
      if(this.state.oldPassword === '') {
        errors.oldPassword = 'Old password must not be blank';
      }
      if(this.state.newPassword === '') {
        errors.newPassword = 'New password must not be blank';
      }
      if(this.state.newPassword2 !== this.state.newPassword) {
        errors.newPassword2 = 'Confirmation must match new password';
      }
      this.setState({ errors });
      return _.isEmpty(errors);
    };

    this.onChangeOldPassword = (event) => {
      this.setState({ oldPassword: event.target.value }, validate);
    };

    this.onChangeNewPassword = (event) => {
      this.setState({ newPassword: event.target.value }, validate);
    };

    this.onChangeNewPassword2 = (event) => {
      this.setState({ newPassword2: event.target.value }, validate);
    };

    this.onSubmit = (event) => {
      event.preventDefault();

      if(validate()) {
        this.props.updatePassword({
          oldPassword: this.state.oldPassword,
          newPassword: this.state.newPassword,
        }).catch(err => {
          if(err.errors) {
            this.setState({ errors: err.errors });
          }
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
            error={!!this.state.errors.oldPassword}
            helperText={this.state.errors.oldPassword}
            value={this.state.oldPassword}
            onChange={this.onChangeOldPassword}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New password"
            InputLabelProps={{ shrink: true }}
            type="password"
            error={!!this.state.errors.newPassword}
            helperText={this.state.errors.newPassword}
            value={this.state.newPassword}
            onChange={this.onChangeNewPassword}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm new password"
            InputLabelProps={{ shrink: true }}
            type="password"
            error={!!this.state.errors.newPassword2}
            helperText={this.state.errors.newPassword2}
            value={this.state.newPassword2}
            onChange={this.onChangeNewPassword2}
          />
          <Button className={classes.button} color="primary" type="submit" disabled={!_.isEmpty(this.state.errors)}>
            Update password
          </Button>
        </form>
      </Paper>
    );
  }
}


export default withStyles(styles)(ChangePassword);
