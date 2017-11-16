import React from 'react';
import { Redirect } from 'react-router';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';

import authActionCreators from '../../redux/authActionCreators';

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false,
    };
    this.logout = (event) => {
      event.preventDefault();
      this.props.signOut()
        .then(() => {
          this.setState({ redirect: true });
        });
    };
  }

  render() {
    if(this.state.redirect) {
      return <Redirect to="/" />;
    }

    return (
      <div className="container">
        <div className="row">
          <h1>User account</h1>
          <button
            type="submit"
            className="btn btn-default"
            onClick={this.logout}
          >
            Log out
          </button>
        </div>
      </div>
    );
  }
}


export default ReactRedux.connect(
  null,
  (dispatch) => ({
    signOut: _.flow(authActionCreators.signOut, dispatch),
  })
)(Account);
