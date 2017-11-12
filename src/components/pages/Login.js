import React from 'react';
import { Redirect } from 'react-router';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';

import authActionCreators from '../../redux/authActionCreators';

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
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if(this.state.redirect) {
      return <Redirect to={from} />;
    }

    let errorNotice = null;
    if(this.state.error) {
      errorNotice = (
        <div className="alert alert-danger" role="alert">
          Log in failed, please try again.
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-offset-4 col-md-4">
            <h1>Please log in</h1>
            <p>You must log in to view the page at <code>{from.pathname}</code>.</p>
            {errorNotice}
            <form onSubmit={this.login}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={this.state.username}
                  onChange={this.onUsernameChange}
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onPasswordChange}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Log in</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}


export default ReactRedux.connect(
  null,
  (dispatch) => ({
    signIn: _.flow(authActionCreators.signIn, dispatch),
  })
)(Login);
