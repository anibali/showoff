import React from 'react';
import { Redirect } from 'react-router';
import auth from '../auth';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { redirect: false };
    this.login = () => {
      auth.signIn().then(() => {
        this.setState({ redirect: true });
      });
    };
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if(this.state.redirect) {
      return <Redirect to={from} />;
    }

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    );
  }
}
