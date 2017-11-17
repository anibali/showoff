import React from 'react';
import { Redirect } from 'react-router';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';

import Header from '../Header';
import authActionCreators from '../../redux/authActionCreators';


const ApiKeyItem = ({ apiKey }) => (
  <li>
    ID: {apiKey.id}, secret key: {apiKey.secretKey}
  </li>
);

const createApiKeyItem = apiKey =>
  <ApiKeyItem key={apiKey.id} apiKey={apiKey} />;

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
    this.addKey = (event) => {
      event.preventDefault();
      this.props.createCurrentUserApiKey();
    };
    this.destroyKeys = (event) => {
      event.preventDefault();
      this.props.destroyCurrentUserApiKeys();
    };
  }

  componentWillMount() {
    if(process.env.IN_BROWSER) {
      this.props.loadCurrentUserApiKeys();
    }
  }

  render() {
    if(this.state.redirect) {
      return <Redirect to="/" />;
    }

    return (
      <div>
        <Header />
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
            <h2>API keys</h2>
            <div className="btn-toolbar" style={{ marginBottom: 12 }}>
              <button
                type="submit"
                className="btn btn-default"
                onClick={this.addKey}
              >
                Add new key
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                onClick={this.destroyKeys}
              >
                Destroy all keys
              </button>
            </div>
            <ul>
              {this.props.user.apiKeys.map(createApiKeyItem)}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}


export default ReactRedux.connect(
  (state) => ({
    user: state.auth.user,
  }),
  (dispatch) => ({
    signOut: _.flow(authActionCreators.signOut, dispatch),
    loadCurrentUserApiKeys: _.flow(authActionCreators.loadCurrentUserApiKeys, dispatch),
    createCurrentUserApiKey: _.flow(authActionCreators.createCurrentUserApiKey, dispatch),
    destroyCurrentUserApiKeys: _.flow(authActionCreators.destroyCurrentUserApiKeys, dispatch),
  })
)(Account);
