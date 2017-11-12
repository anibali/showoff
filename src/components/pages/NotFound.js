import React from 'react';
import { Link } from 'react-router-dom';

import Status from '../Status';

export default () => (
  <Status code={404}>
    <div className="container">
      <div className="row">
        <h1>Page not found</h1>
        <p>
          Sorry, the content that you requested was not found.
        </p>
        <p>
          <Link to="/">Return home</Link>
        </p>
      </div>
    </div>
  </Status>
);
