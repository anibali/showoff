import React from 'react';
import * as ReactRedux from 'react-redux';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';

import authActionCreators from '../redux/authActionCreators';


const Header = ({ signOut }) => (
  <AppBar position="static">
    <Toolbar>
      <Button color="contrast" to="/" component={Link}>Home</Button>
      <Button color="contrast" to="/account" component={Link}>Account</Button>
      <Button color="contrast" onClick={signOut}>Sign out</Button>
    </Toolbar>
  </AppBar>
);


export default ReactRedux.connect(
  null,
  (dispatch) => ({
    signOut: _.flow(authActionCreators.signOut, dispatch),
  })
)(Header);
