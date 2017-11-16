import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router-dom';


const Header = () => (
  <header className="header-bar offset-scrollbar">
    <div className="container">
      <div className="row">
        <ul className="nav nav-pills">
          <li role="presentation">
            <Link to="/">Home</Link>
          </li>
          <li role="presentation">
            <Link to="/account">Account</Link>
          </li>
        </ul>
      </div>
    </div>
  </header>
);


export default ReactRedux.connect(
  (state) => ({
    username: state.auth.username,
  })
)(Header);
