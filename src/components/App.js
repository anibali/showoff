import React from 'react';
import DocumentTitle from 'react-document-title';
import { Route, Switch } from 'react-router';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { teal, orange } from 'material-ui/colors';

import frontendRoutes from './frontendRoutes';
import PrivateRoute from './PrivateRoute';


const theme = createMuiTheme({
  palette: {
    primary: teal,
    secondary: orange,
    type: 'light',
  },
});

const buildRoute = ({ path, component, exact, requiresAuth }) => {
  const RouteComponent = requiresAuth ? PrivateRoute : Route;
  const props = {
    key: path, path, component, exact,
  };
  return <RouteComponent {...props} />;
};

const App = () => (
  <DocumentTitle title="Showoff">
    <MuiThemeProvider theme={theme} sheetsManager={new WeakMap()}>
      <div className="fill-space">
        <Switch>
          {frontendRoutes.map(buildRoute)}
        </Switch>
      </div>
    </MuiThemeProvider>
  </DocumentTitle>
);


export default App;
