import React from 'react';
import { Redirect } from 'react-router';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

import authActionCreators from '../../redux/authActionCreators';


const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 4,
  },
  container: {
    padding: 16,
  }
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      redirect: false,
      error: false,
    };
    this.login = (event) => {
      event.preventDefault();
      this.props.signIn(this.state.username, this.state.password)
        .then(() => {
          this.setState({ redirect: true });
        })
        .catch(() => {
          this.setState({ error: true, password: '' });
        });
    };
    this.onUsernameChange = (event) => {
      this.setState({ username: event.target.value });
    };
    this.onPasswordChange = (event) => {
      this.setState({ password: event.target.value });
    };
  }

  render() {
    const { classes } = this.props;
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if(this.state.redirect) {
      return <Redirect to={from} />;
    }

    let errorNotice = null;
    if(this.state.error) {
      errorNotice = (
        <Typography type="body1" color="error">
          Log in failed, please try again.
        </Typography>
      );
    }

    return (
      <div className={`container ${classes.container}`} >
        <Grid container justify="center" spacing={24}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.paper}>
              <Typography type="headline" gutterBottom>
                Please log in
              </Typography>
              {errorNotice}
              <form onSubmit={this.login}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Username"
                  type="text"
                  value={this.state.username}
                  onChange={this.onUsernameChange}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Password"
                  type="password"
                  value={this.state.password}
                  onChange={this.onPasswordChange}
                />
                <Button raised color="primary" type="submit">
                  Log in
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}


export default ReactRedux.connect(
  null,
  (dispatch) => ({
    signIn: _.flow(authActionCreators.signIn, dispatch),
  })
)(withStyles(styles)(Login));
