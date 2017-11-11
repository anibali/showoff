import React from 'react';
import { Route } from 'react-router';

export default ({ code, children }) => {
  const render = ({ staticContext }) => {
    if(staticContext) {
      staticContext.status = code;
    }
    return children;
  };
  return <Route render={render} />;
};
