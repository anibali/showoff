import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import { create as jssCreate } from 'jss';
import jssPreset from 'jss-preset-default';
import JssProvider from 'react-jss/lib/JssProvider';
import createGenerateClassName from 'material-ui/styles/createGenerateClassName';

import App from './App';


const jss = jssCreate(jssPreset());
jss.options.createGenerateClassName = createGenerateClassName;

const ServerRoot = ({ store, location, context, sheetsRegistry }) => (
  <Provider store={store}>
    <JssProvider registry={sheetsRegistry} jss={jss}>
      <StaticRouter location={location} context={context}>
        <App />
      </StaticRouter>
    </JssProvider>
  </Provider>
);


export default ServerRoot;
